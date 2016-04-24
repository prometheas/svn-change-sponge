'use strict';

var _ = require('lodash');
var deasync = require('deasync');
var shell = require('shelljs');
var svn = require('svn-interface');
var util = require('util');

var svnStatus = deasync(svn.status);

function normalizeEntry(entry) {
  var normalized = entry;

  if (_.isUndefined(normalized)) {
    normalized = [];
  }

  if (!_.isArray(normalized)) {
    normalized = [normalized];
  }

  normalized = _.map(normalized, function normalizeObject(currentEntry) {
    return {
      absPath: currentEntry._attribute.path,
      status: currentEntry['wc-status']._attribute.item
    };
  });

  return normalized;
}

function getNormalizedFileStatusData(wcPath) {
  var result = svnStatus(wcPath, {});
  return normalizeEntry(result.status.target.entry);
}

function filterEntriesByStatus(entries, status) {
  return _.filter(entries, function statusFilter(entry) {
    return entry.status === status;
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
  getUnversionedFiles: function getUnversionedFiles(wcPath) {
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
  hasUnversionedFiles: function hasUnversionedFiles(wcPath) {
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
   * Prepares files in the wc directory for committing.
   *
   * @param {string} wcPath
   */
  prepareWcForCommitting: function prepareWcForCommitting(wcPath) {
    var unversionedFiles = module.exports.getUnversionedFiles(wcPath);
    var missingFiles = module.exports.getMissingFiles(wcPath);
    var chunkSize = 20;

    _.forEach(_.chunk(unversionedFiles, chunkSize), function svnAddNew(filesInChunk) {
      var paths = _.flatMap(filesInChunk, function extractAbsolutePaths(entry) {
        return [entry.absPath];
      });

      shell.exec(util.format('svn add "%s"', paths.join('" "')), {
        silent: true
      });
    });

    _.forEach(_.chunk(missingFiles, chunkSize), function svnDeleteMissing(filesInChunk) {
      var paths = _.flatMap(filesInChunk, function extractAbsolutePaths(entry) {
        return [entry.absPath];
      });

      shell.exec(util.format('svn delete "%s"', paths.join('" "')), {
        silent: true
      });
    });
  }
};
