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
  getFilesByStatus: function getFilesByStatus(wcPath, status) {
    var entries = getNormalizedFileStatusData(wcPath);
    return filterEntriesByStatus(entries, status);
  },

  getMissingFiles: function getMissingFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'missing');
  },

  getModifiedFiles: function getModifiedFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'modified');
  },

  getNewFiles: function getNewFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'unversioned');
  },

  hasMissingFiles: function hasMissingFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'missing').length > 0;
  },

  hasModifiedFiles: function hasModifiedFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'modified').length > 0;
  },

  hasNewFiles: function hasNewFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'unversioned').length > 0;
  },

  isWcDirty: function isWcDirty(wcPath) {
    return getNormalizedFileStatusData(wcPath).length > 0;
  },

  pushChanges: function absorbChanges() {

  }
}
