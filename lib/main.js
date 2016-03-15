'use strict';

/**
 * This module projects the project's primary functionality.
 */

var deasync = require('deasync');
var svn = require('svn-interface');
var _ = require('lodash');

var svnStatus = deasync(svn.status);
var svnAdd = deasync(svn.add);
var svnDelete = deasync(svn.delete);
var svnCommit = deasync(svn.commit);


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
  var result = svnStatus(wcPath, {});
  return normalizeEntry(result.status.target.entry);
}

function filterEntriesByStatus(entries, status) {
  return _.filter(entries, function statusFilter(entry) {
    return entry['wc-status']._attribute.item === status;
  });
}

module.exports = {
  /**
   * Retrieves the svn status output for files in whe wc whose status
   * matches the specified value.
   *
   * @param {string} wcPath
   * @param {string} status
   *
   * @return {array}  filtered `svn status` output.
   */
  getFilesByStatus: function getFilesByStatus(wcPath, status) {
    var entries = getNormalizedFileStatusData(wcPath);
    return filterEntriesByStatus(entries, status);
  },

  /**
   * Compiles a list of files in the wc whose status is `missing`.
   *
   * @param {string} wcPath
   *
   * @return {array}
   */
  getMissingFiles: function getMissingFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'missing');
  },

  /**
   * Compiles a list of files in the wc whose status is `modified`.
   *
   * @param {string} wcPath
   *
   * @return {array}
   */
  getModifiedFiles: function getModifiedFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'modified');
  },

  /**
   * Compiles a list of files in the wc whose status is `unversioned`.
   *
   * @param {string} wcPath
   *
   * @return {array}
   */
  getNewFiles: function getNewFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'unversioned');
  },

  /**
   * Answers whether any files are found missing in the wc.
   *
   * @param {string} wcPath
   *
   * @return {Boolean}
   */
  hasMissingFiles: function hasMissingFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'missing').length > 0;
  },

  /**
   * Answers whether any files are found to be modified in the wc.
   *
   * @param {string} wcPath
   *
   * @return {Boolean}
   */
  hasModifiedFiles: function hasModifiedFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'modified').length > 0;
  },

  /**
   * Answers whether any new files are found in the wc.
   *
   * @param {string} wcPath
   *
   * @return {Boolean}
   */
  hasNewFiles: function hasNewFiles(wcPath) {
    return module.exports.getFilesByStatus(wcPath, 'unversioned').length > 0;
  },

  /**
   * Answers whether any modifications are found in the wc dir.
   *
   * @param {string} wcPath
   *
   * @return {Boolean}
   */
  isWcDirty: function isWcDirty(wcPath) {
    return getNormalizedFileStatusData(wcPath).length > 0;
  },

  /**
   * Pushes all changes found in the wc directory to the repository.
   *
   * @param {string} wcPath
   * @param {string} commitMessage
   */
  pushChanges: function pushChanges(wcPath, commitMessage) {
    _.forEach(module.exports.getNewFiles(wcPath), function svnAddNew(newFileEntry) {
      var newFilePath = newFileEntry._attribute.path;
      svnAdd(newFilePath);
    });

    _.forEach(module.exports.getMissingFiles(wcPath), function svnDeleteMissing(missingFileEntry) {
      var missingFilePath = missingFileEntry._attribute.path;
      svnDelete(missingFilePath);
    });

    svnCommit(wcPath, {
      message: commitMessage
    });
  }
};
