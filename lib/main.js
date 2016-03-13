'use strict';

/**
 * This module projects the project's primary functionality.
 */

var deasync = require('deasync');
var svn = require('svn-interface');
var _ = require('lodash');

var status = deasync(svn.status)


function normalizeEntry(entry) {
  var normalized = entry;

  if (_.isUndefined(normalized)) {
    normalized = [];
  }

  if (! _.isArray(normalized)) {
    normalized = [normalized];
  }

  return normalized;
}

module.exports = {
  hasNewFiles: function hasNewFiles(wcPath) {
    var result = status(wcPath, {});
    var entries = normalizeEntry(result.status.target.entry);
    var statuses = [];

    _.forEach(entries, function(entry) {
      statuses.push(entry['wc-status']._attribute.item);
    });

    return _.includes(statuses, 'unversioned');
  },

  pushChanges: function absorbChanges() {

  }
}
