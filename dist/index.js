"use strict";

var BinarySplitter = require("./binary_splitter");

var AugmentedDiffParser = require("./parsers/adiff");

var KinesisSink = require("./sinks/kinesis_stream");

var AugmentedDiffs = require("./sources/adiff_stream");

var Changes = require("./sources/change_stream");

var Changesets = require("./sources/changeset_stream");

var KinesisSource = require("./sources/kinesis_stream");

module.exports = {
  BinarySplitter,
  parsers: {
    AugmentedDiffParser
  },
  sinks: {
    Kinesis: KinesisSink
  },
  sources: {
    AugmentedDiffs,
    Changes,
    Changesets,
    Kinesis: KinesisSource
  }
};