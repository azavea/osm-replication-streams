#!/usr/bin/env node
"use strict";

require("epipebomb")();

var osm2obj = require("osm2obj");

var stringify = require("stringify-stream");

var _require = require(".."),
    BinarySplitter = _require.BinarySplitter,
    _require$sources = _require.sources,
    Changes = _require$sources.Changes,
    KinesisSource = _require$sources.Kinesis; // const rs = Changes({
//   infinite: true,
//   checkpoint: sequenceNumber => console.warn(`${sequenceNumber} fetched.`)
// });
//
// rs.pipe(process.stdout);
// rs
//   .pipe(
//     osm2obj({
//       coerceIds: false
//     })
//   )
//   .pipe(stringify())
//   .pipe(process.stdout);
// rs.pipe(new BinarySplitter("\u001e")).pipe(new KinesisStream("changes-xml"))


KinesisSource({
  streamName: "changes-xml"
}).pipe(process.stdout);