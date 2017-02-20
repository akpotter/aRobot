// Generated by CoffeeScript 1.9.3
(function() {
  var Promise, constants, fs, path;

  Promise = require('bluebird');

  fs = Promise.promisifyAll(require('fs'));

  constants = require('constants');

  path = require('path');

  exports.durableWriteFile = function(file, data) {
    return fs.writeFileAsync(file + '.tmp', data).then(function() {
      return fs.openAsync(file + '.tmp', 'r');
    }).tap(fs.fsyncAsync).then(fs.closeAsync).then(function() {
      return fs.renameAsync(file + '.tmp', file);
    }).then(function() {
      return fs.openAsync(path.dirname(file), 'r', constants.O_DIRECTORY);
    }).tap(fs.fsyncAsync).then(fs.closeAsync);
  };

  exports.copyFile = function(source, target) {
    return fs.readFileAsync(source).then(function(rf) {
      return fs.writeFileAsync(target, rf);
    });
  };

}).call(this);
