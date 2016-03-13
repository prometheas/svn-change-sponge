'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('InvalidWorkingCopyException', function () {
  it('should be a function', function () {
    expect(require('../../../lib/exception/InvalidWorkingCopyException')).to.be.a('function');
  });

  it('should have a `message` property', function () {
    var InvalidWorkingCopyException = require('../../../lib/exception/InvalidWorkingCopyException');
    var e = new InvalidWorkingCopyException('foo');
    expect(e.message).to.be.a('string');
  });
});
