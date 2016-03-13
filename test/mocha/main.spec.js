'use strict';

var chai = require('chai');
var expect = chai.expect;

var util = require('util');
var shell = require('shelljs');

var sponge = require('../../lib/main.js');

describe('SvnChangeSponge', function () {

  var testPath = '/tmp/testing';
  var repoUrl = 'http://svn/';

  before(function () {
    shell.exec(util.format('mkdir -p "%s"; cd "%s"; rm -rf *', testPath, testPath));
    shell.exec('svn co http://svn/');
  });

  describe('the module', function () {
    it('should be an object', function () {
      expect(sponge).to.be.a('object');
    });

    it('should have a function called #absorbChanges', function () {
      expect(sponge.absorbChanges).to.be.a('function');
    });
  });

  describe('ability to validate Subversion wc directory', function () {
    it('should throw an error when pointed at a non-Subversion wc directory', function () {

    });
  });
});
