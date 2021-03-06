#!/usr/bin/env node
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('epipebomb')();

var osm2obj = require("osm2obj");

var stringify = require("stringify-stream");

var _require = require(".."),
    BinarySplitter = _require.BinarySplitter,
    Kinesis = _require.sinks.Kinesis,
    Changes = _require.sources.Changes;

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var rs;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Changes({
              // infinite: true,
              checkpoint: function checkpoint(sequenceNumber) {
                return console.warn(`${sequenceNumber} fetched.`);
              }
            });

          case 2:
            rs = _context.sent;
            // rs.pipe(process.stdout);
            // rs.pipe(Osm2Json()).pipe(stringify()).pipe(process.stdout);
            rs.pipe(new BinarySplitter("\u001e")).pipe(new Kinesis("changes-xml"));
            rs.on("finish", function () {
              return console.log("done");
            }); // TODO when writing to kinesis, make sure that elements are ordered such that they don't depend on entities that haven't been flushed

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _main.apply(this, arguments);
}

main();