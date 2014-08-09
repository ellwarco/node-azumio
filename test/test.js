"use strict";

var nock = require("nock");
var expect = require("chai").expect;

var Azumio = require("../");

describe("Azumio", () => {
  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  it("requires username and password in constructor", () => {
    expect(() => new Azumio()).to.throw(/are required/);
  });

  it("performs login on first request", () => {
    var azumio = new Azumio("user", "pass");

    nock(azumio.baseUrl)
      .post("/login", {
        email: "user",
        password: "pass"
      })
      .reply(200, "", {
        "set-cookie": ["oath_token_azumio=test-token"]
      });

    nock(azumio.baseUrl, {
        reqheaders: {
          "cookie": "oath_token_azumio=test-token"
        }
      })
      .get("/foo")
      .reply(200, "it works");

    return azumio._request("/foo").then(function() {
      expect(azumio.authToken).to.eql("test-token");
    });
  });

  it("performs login only on first request", () => {
    var azumio = new Azumio("user", "pass");

    nock(azumio.baseUrl, {
        reqheaders: {
          "cookie": "oath_token_azumio=test-token"
        }
      })
      .get("/foo")
      .reply(200, "it works");

    azumio.authToken = "test-token";

    return azumio._request("/foo").then(function(result) {
      expect(result).to.eql("it works");
    });
  });
});
