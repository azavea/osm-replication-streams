#!/usr/bin/env node
"use strict";

require("epipebomb")();

var stringify = require("stringify-stream");

process.on("unhandledRejection", function (err) {
  console.error(err.stack);
  process.exit(1);
});

var _require = require(".."),
    AugmentedDiffParser = _require.parsers.AugmentedDiffParser,
    AugmentedDiffs = _require.sources.AugmentedDiffs;

var checkpoint = function checkpoint(sequenceNumber) {
  return console.warn(`${sequenceNumber} fetched.`);
};

var rs = AugmentedDiffs({
  infinite: true,
  initialSequence: 2813055
});
var processor = new AugmentedDiffParser().on("error", console.warn).on("sequenceEnd", checkpoint); // process.stdin

rs.pipe(processor).pipe(stringify()).pipe(process.stdout); // rs
//   .pipe(
//     osm2obj({
//       coerceIds: false
//     })
//   )
//   .pipe(stringify())
//   .pipe(process.stdout);