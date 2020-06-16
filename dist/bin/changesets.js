#!/usr/bin/env node
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('epipebomb')();

var osm2obj = require("osm2obj");

var stringify = require("stringify-stream");

var _require = require(".."),
    BinarySplitter = _require.BinarySplitter,
    _require$sources = _require.sources,
    Changesets = _require$sources.Changesets,
    Kinesis = _require$sources.Kinesis;

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
            return Kinesis({
              streamName: "changesets-xml"
            });

          case 2:
            rs = _context.sent;
            // rs.pipe(process.stdout);
            rs.on("data", function (data) {
              return console.log(data);
            });

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _main.apply(this, arguments);
}

main();