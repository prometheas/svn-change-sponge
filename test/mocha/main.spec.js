'use strict';

var chai = require('chai');
var expect = chai.expect;

var dircompare = require('dir-compare');
var _ = require('lodash');
var path = require('path');
var shell = require('shelljs');
var svn = require('svn-interface');
var temp = require('temp').track();
var util = require('util');

var sponge = require('../../lib/main.js');
var repoHost = 'svn';

/**
 * Generates a Subversion URL from a path.
 *
 * @param {string} svnPath
 *
 * @return {string}
 */
function getSvnUrl(svnPath) {
  if (! svnPath.match(/^\//)) {
    throw 'svnPath param must start with "/"';
  }

  return 'http://' + repoHost + svnPath;
}

/**
 * Answers whether the identified wc directory matches the HEAD revision
 * in the Subversion repository.
 *
 * @return {boolean}
 */
function doesWcMatchRepoHead(context) {
  var results;
  var headWcPath = temp.mkdirSync('repo-state-');

  execSilent(util.format('svn co "%s" "%s"', context.svnUrl, headWcPath));
  results = dircompare.compareSync(context.dir, headWcPath, {
    compareContent: true,
    excludeFilter: '.svn'
  });

  return results.differences === 0;
}

/**
 * Executes a command in the shell and suppresses output to stdout.
 *
 * @param {string} command
 */
function execSilent(command) {
  shell.exec(command, { silent: true });
}

function svnAddAndCommit(msg) {
  execSilent(util.format('svn add *; svn ci -m "%s"', _.toString(msg).replace(/"/, '\\"')));
}

/**
 * Creates a new, "clean" context for testing.
 *
 * A context consists of a location in the Subversion repo, coupled with
 * a wc temp directory on the local filesystem.
 *
 * @return {object} {
 *   @param {string} dir     path to temp dir
 *   @param {string} svnUrl  base URL for the subversion context
 * }
 */
function createTestContext() {
  var tempDir = temp.mkdirSync();
  var context = {
    dir: tempDir,
    svnUrl: getSvnUrl('/' + path.basename(tempDir))
  };

  execSilent(util.format('svn mkdir "%s" -m "whatevs"', context.svnUrl));
  execSilent(util.format('svn co "%s" "%s"', context.svnUrl, context.dir));
  shell.cd(context.dir);

  return context;
}

describe('SvnPusher', function () {
  describe('the module', function () {
    it('should be an object', function () {
      expect(sponge).to.be.a('object');
    });

    it('should have a function called #pushChanges', function () {
      expect(sponge.pushChanges).to.be.a('function');
    });
  });

  describe.skip('ability to validate Subversion wc directory', function () {
    // coming soon
  });

  describe('wc change detection', function () {
    it('should be able to detect new files', function () {
      var context = createTestContext();
      var filePath = path.join(context.dir, 'foo.txt');

      expect(sponge.hasNewFiles(context.dir)).to.be.false;
      shell.touch(filePath);
      expect(sponge.hasNewFiles(context.dir)).to.be.true;
      shell.rm(filePath);
      expect(sponge.hasNewFiles(context.dir)).to.be.false;
    });

    it('should be able to identify new files', function () {
      var context = createTestContext();

      expect(sponge.getNewFiles(context.dir)).to.be.empty;

      shell.touch('foo-add.txt');
      expect(sponge.getNewFiles(context.dir)).not.to.be.empty;
      expect(sponge.getNewFiles(context.dir)).to.have.length(1);

      var addedFile = sponge.getNewFiles(context.dir)[0]._attribute.path;
      expect(path.basename(addedFile)).to.equal('foo-add.txt');

      svnAddAndCommit('committing file for identify new files test');
      expect(sponge.getNewFiles(context.dir)).to.be.empty;
    });

    it('should be able to detect missing files', function () {
      var context = createTestContext();
      var filePath = path.join(context.dir, 'foo.txt');

      shell.touch(filePath);
      svnAddAndCommit('committing file for delete detection test');
      expect(sponge.hasMissingFiles(context.dir)).to.be.false;

      shell.rm(filePath);
      expect(sponge.hasMissingFiles(context.dir)).to.be.true;
    });

    it('should be able to identify missing files', function () {
      var context = createTestContext();

      shell.touch('foo.txt');
      svnAddAndCommit('committing file for identify new files test');
      expect(sponge.getMissingFiles(context.dir)).to.be.empty;

      shell.rm('foo.txt');
      expect(sponge.getMissingFiles(context.dir)).not.to.be.empty;
      expect(sponge.getMissingFiles(context.dir)).to.have.length(1);

      var missingFile = sponge.getMissingFiles(context.dir)[0]._attribute.path;
      expect(path.basename(missingFile)).to.equal('foo.txt');
    });

    it('should be able to detect modified files', function () {
      var context = createTestContext();

      shell.touch('modified.txt');
      svnAddAndCommit('committing file for modification detection test');
      expect(sponge.hasModifiedFiles(context.dir)).to.be.false;

      execSilent('echo "stuff" >> modified.txt');
      expect(sponge.hasModifiedFiles(context.dir)).to.be.true;
    });

    it('should be able to identify modified files', function () {
      var context = createTestContext();

      shell.touch('foo-modified.txt');
      svnAddAndCommit('committing file for identify modified file test');
      expect(sponge.getModifiedFiles(context.dir)).to.be.empty;

      execSilent('echo "new content" >> foo-modified.txt');
      expect(sponge.getModifiedFiles(context.dir)).not.to.be.empty;

      var modifiedFile = sponge.getModifiedFiles(context.dir)[0]._attribute.path;
      expect(path.basename(modifiedFile)).to.equal('foo-modified.txt');
    });

    it('should be able to detect a dirty directory', function () {
      var context = createTestContext();
      var filePath = path.join(context.dir, 'foo.txt');

      expect(sponge.isWcDirty(context.dir)).to.be.false;
      shell.touch(filePath);
      expect(sponge.isWcDirty(context.dir)).to.be.true;

      svnAddAndCommit('committing file for dirty wc test');
      expect(sponge.isWcDirty(context.dir)).to.be.false;
    });
  });

  describe('ability to push basic changes to repo', function () {
    it('should be able to add unknown files to the repo', function () {
      var context = createTestContext();

      shell.touch(['1', '2']);
      expect(doesWcMatchRepoHead(context)).to.be.false;

      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;
    });

    it('should be able to commit modified files to the repo', function () {
      var context = createTestContext();

      shell.touch(['1', '2', '3']);
      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;

      execSilent('echo "changes" >> "1"');
      expect(doesWcMatchRepoHead(context)).to.be.false;
      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;
    });

    it('should be able to delete missing files from the repo', function () {
      var context = createTestContext();

      shell.touch(['1', '2', '3']);
      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;
      shell.rm('2');
      expect(doesWcMatchRepoHead(context)).to.be.false;

      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;
    });

    it('should be able to add new directories to the repository', function () {
      var context = createTestContext();

      shell.mkdir('hello');
      shell.touch('hello/file');
      expect(doesWcMatchRepoHead(context)).to.be.false;

      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;
    });

    it('should be able to delete missing directories from the repository', function () {
      var context = createTestContext();

      shell.mkdir('hello');
      shell.touch('hello/file');
      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;

      shell.rm('-rf', 'hello');
      expect(doesWcMatchRepoHead(context)).to.be.false;

      sponge.pushChanges(context.dir, 'pushing changes');
      expect(doesWcMatchRepoHead(context)).to.be.true;
    });
  });
});
