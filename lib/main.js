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

function getNormalizedFileStatusData(wcPath) {
  var result = status(wcPath, {});
  return normalizeEntry(result.status.target.entry);
}

function filterEntriesByStatus(entries, status) {
  return _.filter(entries, function(entry) {
    return entry['wc-status']._attribute.item === status;
  });
}

module.exports = {
  getMissingFiles: function getMissingFiles(wcPath) {
    var entries = getNormalizedFileStatusData(wcPath);
    return filterEntriesByStatus(entries, 'missing');
  },

  getModifiedFiles: function getModifiedFiles(wcPath) {
    var entries = getNormalizedFileStatusData(wcPath);
    return filterEntriesByStatus(entries, 'modified');
  },

  getNewFiles: function getNewFiles(wcPath) {
    var entries = getNormalizedFileStatusData(wcPath);
    return filterEntriesByStatus(entries, 'unversioned');
  },

  hasMissingFiles: function hasMissingFiles(wcPath) {
    var entries = getNormalizedFileStatusData(wcPath);
    var statuses = [];

    _.forEach(entries, function(entry) {
      statuses.push(entry['wc-status']._attribute.item);
    });

    return _.includes(statuses, 'missing');
  },

  hasModifiedFiles: function hasModifiedFiles(wcPath) {
    var entries = getNormalizedFileStatusData(wcPath);
    var statuses = [];

    _.forEach(entries, function(entry) {
      statuses.push(entry['wc-status']._attribute.item);
    });

    return _.includes(statuses, 'modified');
  },

  hasNewFiles: function hasNewFiles(wcPath) {
    var entries = getNormalizedFileStatusData(wcPath);
    var statuses = [];

    _.forEach(entries, function(entry) {
      statuses.push(entry['wc-status']._attribute.item);
    });

    return _.includes(statuses, 'unversioned');
  },

  isWcDirty: function isWcDirty(wcPath) {
    return getNormalizedFileStatusData(wcPath).length > 0;
  },

  pushChanges: function absorbChanges() {

  }
}
