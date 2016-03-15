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
function doesWcMatchRepoHead(wcPath) {
  var results;
  var repoTemp = path.join(temp.mkdirSync('repo-state-'), 'wc');
  svn.checkout(getSvnUrl('/'), repoTemp);

  results = dircompare.compareSync(wcPath, repoTemp, {
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

      shell.touch('foo.txt');
      expect(sponge.getNewFiles(context.dir)).not.to.be.empty;
      expect(sponge.getNewFiles(context.dir)).to.have.length(1);

      shell.touch('bar.txt');
      expect(sponge.getNewFiles(context.dir)).to.have.length(2);

      svnAddAndCommit('committing file for identify new files test');
      expect(sponge.getNewFiles(context.dir)).to.be.empty;
    });

    it('should be able to detect missing files', function () {
      var context = createTestContext();
      var filePath = path.join(context.dir, 'foo.txt');

      shell.touch(filePath);
      execSilent('svn add *; svn ci -m "committing file for delete detection test"');
      expect(sponge.hasMissingFiles(context.dir)).to.be.false;

      shell.rm(filePath);
      expect(sponge.hasMissingFiles(context.dir)).to.be.true;
    });

    it('should be able to detect modified files', function () {
      var context = createTestContext();
      var filePath = path.join(context.dir, 'foo.txt');

      shell.touch(filePath);
      execSilent('svn add *; svn ci -m "committing file for modification detection test"');
      expect(sponge.hasModifiedFiles(context.dir)).to.be.false;

      execSilent('echo "stuff" >> ' + filePath);
      expect(sponge.hasModifiedFiles(context.dir)).to.be.true;
    });

    it('should be able to detect a dirty directory', function () {
      var context = createTestContext();
      var filePath = path.join(context.dir, 'foo.txt');

      expect(sponge.isWcDirty(context.dir)).to.be.false;
      shell.touch(filePath);
      expect(sponge.isWcDirty(context.dir)).to.be.true;

      execSilent('svn add *; svn ci -m "committing file for dirty wc test"');
      expect(sponge.isWcDirty(context.dir)).to.be.false;
    });
  });

  describe.skip('ability to push basic changes to repo', function () {
    it('should be able to detect, add, and commit a new file', function () {
      var context = createTestContext();

      shell.touch(path.join(context.dir, 'foo.txt'));
      expect(doesWcMatchRepoHead(context.dir)).to.be.false;

      sponge.pushChanges();
      expect(doesWcMatchRepoHead(context.dir)).to.be.true;
    });
  });
});
