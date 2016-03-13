'use strict';

var chai = require('chai');
var expect = chai.expect;

// Uncoment the next line to use the "should" API
// var should = chai.should();
// see http://chaijs.com/guide/styles/#should

var pusher = require('../../lib/main.js');

describe('SvnChangeSponge module', function () {
  it('should not be a function', function () {
    expect(pusher).to.be.a('function');
  });
});
