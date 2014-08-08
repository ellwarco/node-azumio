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

    azumio.heartrate();
  });
});
