"use strict";

var modulesDir = require("path").join(__dirname, "node_modules");

module.exports = function(file) {
  return !file.startsWith(modulesDir);
};
