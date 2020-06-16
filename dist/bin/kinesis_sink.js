#!/usr/bin/env node
"use strict";

require("epipebomb")();

var osm2obj = require("osm2obj");

var stringify = require("stringify-stream");

var _require = require(".."),
    Kinesis = _require.sinks.Kinesis,
    Changes = _require.sources.Changes;

var rs = Changes({
  infinite: true,
  checkpoint: function checkpoint(sequenceNumber) {
    return console.warn(`${sequenceNumber} fetched.`);
  }
});
rs.pipe(osm2obj()).pipe(stringify()).pipe(new Kinesis("changes-tmp"));
rs.on("finish", function () {
  return console.log("done");
});
rs.on("error", function (err) {
  return console.warn("Stream error:", err);
});