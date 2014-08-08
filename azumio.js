"use strict";

// This is the library entrypoint.
// If there exists an azumio.dist.js in the current directory, we delegate to that. Otherwise, it's assumed we're in
// dev mode, wherein we delegate to the raw azumio-es6.js module, using Traceurified to shim in Traceur.

var fs = require("fs"),
    path = require("path");

if (fs.existsSync(path.join(__dirname, "azumio.dist.js"))) {
  return require("./azumio.dist");
} else {
  require("traceurified")(function(file) {
    return file.indexOf("node_modules") < 0;
  });
  return require("./azumio.es6");
}
