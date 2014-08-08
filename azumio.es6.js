"use strict";

var Promise = require("bluebird");
var request = require("request");

class Azumio {
  constructor(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
  }

  _request() {
    
  }
}

module.exports = Azumio;
