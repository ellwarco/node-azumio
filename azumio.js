"use strict";

var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var tough = require("tough-cookie");

var defaultBaseUrl = "http://api.azumio.com";

class Azumio {
  constructor(email, password, baseUrl = defaultBaseUrl) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    this.baseUrl = baseUrl;
    this.email = email;
    this.authToken = false;

    this._login = Promise.coroutine(function*() {
      var [response] = yield request.postAsync(`${this.baseUrl}/login`, {
        form: {
          email: this.email,
          password: password
        }
      });

      // Look for the oath_token_azumio cookie. If it's not there,
      // login was incorrect, or something is wrong.
      var cookies = response.headers["set-cookie"];
      var oauthToken = cookies
        .map(rawCookie => tough.parse(rawCookie))
        .find(cookie => cookie.key === "oath_token_azumio")
        .value;

      if (!oauthToken) {
        throw new Error("Login failed. Check login details and service status.");
      }

      this.authToken = oauthToken;
    }.bind(this));

    this._request = Promise.coroutine(function*(uri, qs) {
      if (!this.authToken) {
        yield this._login();
      }

      var [response] = yield request.getAsync(`${this.baseUrl}${uri}`, {
        qs,
        headers: {
          Cookie: `oath_token_azumio=${this.authToken}`,
          "Content-Type": "application/json",
        },
        json: true,
      });

      return response.body;
    }.bind(this));
  }

  // TODO: figure out how offsetting works. Wrap response in a proper container.
  heartrate(callback) {
    var responsePromise = this._request("/v2/checkins.csv", {
      _format: "json",
      _fields: ["id", "timestamp", "type", "value", "note", "tags"].join(","),
      type: "heartrate",
      limit: 2000,
      _expand: "none",
    });

    return responsePromise.then(function(response) {
      var data = response.checkins.map(checkin => ({
        id: checkin.id,
        tags: checkin.tags,
        timestamp: checkin.timestamp,
        rate: checkin.value
        // TODO: notes?
      }));

      data.hasMore = response.hasMore;
      return data;
    }).nodeify(callback);
  }
}

module.exports = Azumio;
