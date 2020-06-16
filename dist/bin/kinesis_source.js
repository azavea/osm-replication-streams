#!/usr/bin/env node
"use strict";

require("epipebomb")();

var _require = require(".."),
    KinesisSource = _require.sources.Kinesis;

KinesisSource({
  streamName: "changes-tmp"
}).pipe(process.stdout);