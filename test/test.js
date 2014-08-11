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

  it("returns heartrate data correctly", () => {
    var azumio = new Azumio("user", "pass");

    nock(azumio.baseUrl)
      .filteringPath(/\?.*$/, "?_query_")
      .get("/v2/checkins.csv?_query_")
      .reply(200, {
        hasMore: true,
        checkins: [
          {
            value: 123,
            tags: ["foo"],
            timestamp: 321,
          }
        ]
      });

    azumio.authToken = "test-token";

    return azumio.heartrate().then(function(result) {
      expect(result.hasMore).to.be.true;
      expect(result).to.have.length(1);
      expect(result[0]).to.eql({
        rate: 123,
        timestamp: 321,
        tags: ["foo"]
      });
    });
  });
});
