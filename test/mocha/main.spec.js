'use strict';

var chai = require('chai');
var expect = chai.expect;

var dircompare = require('dir-compare');
var path = require('path');
var shell = require('shelljs');
var svn = require('svn-interface');
var temp = require('temp');

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
function doesWcMatchRepoHead() {
  var results;
  var repoTemp = path.join(temp.mkdirSync('repo-state-'), 'wc');
  svn.checkout(getSvnUrl('/'), repoTemp);

  results = dircompare.compareSync(testWcPath, repoTemp, {
    compareContent: true,
    excludeFilter: '.svn'
  });

  return results.differences === 0;
}


describe('SvnPusher', function () {
  /** @var testWcPath string the path of the testing root dir */
  var testWcPath = path.join(temp.mkdirSync('testing'), 'wc');

  before(function (done) {
    svn.checkout(getSvnUrl('/'), testWcPath, done);
  });

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
      expect(sponge.hasNewFiles(testWcPath)).to.be.false;
      shell.touch(path.join(testWcPath, 'foo.txt'));
      expect(sponge.hasNewFiles(testWcPath)).to.be.true;
    });
  });

  describe.skip('ability to push basic changes to repo', function () {
    it('should be able to detect, add, and commit a new file', function () {
      shell.touch(path.join(testWcPath, 'foo.txt'));
      expect(doesWcMatchRepoHead()).to.be.false;

      sponge.pushChanges();
      expect(doesWcMatchRepoHead()).to.be.true;
    });
  });
});
