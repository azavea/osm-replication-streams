"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _ = require("highland");

var AWS = require("aws-sdk");

var promisify = require("util.promisify");

var kinesis = new AWS.Kinesis();
var describeStream = promisify(kinesis.describeStream.bind(kinesis));
var getRecords = promisify(kinesis.getRecords.bind(kinesis));
var getShardIterator = promisify(kinesis.getShardIterator.bind(kinesis));

module.exports = function (options) {
  var opts = _objectSpread({
    // we only expect records every minute
    delay: 15e3
  }, options);

  var shardIterator;
  return _(
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(push, next) {
      var stream, shards, rsp, _rsp, lag, records;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return describeStream({
                StreamName: opts.streamName
              });

            case 2:
              stream = _context.sent;
              shards = stream.StreamDescription.Shards;

              if (!(shardIterator == null)) {
                _context.next = 9;
                break;
              }

              _context.next = 7;
              return getShardIterator({
                // TODO create ShardIterators for all shards
                ShardId: shards[0].ShardId,
                // TODO make me configurable
                ShardIteratorType: "LATEST",
                StreamName: opts.streamName
              });

            case 7:
              rsp = _context.sent;
              shardIterator = rsp.ShardIterator;

            case 9:
              _context.prev = 9;
              _context.next = 12;
              return getRecords({
                ShardIterator: shardIterator
              });

            case 12:
              _rsp = _context.sent;
              lag = _rsp.MillisBehindLatest, records = _rsp.Records;
              shardIterator = _rsp.NextShardIterator;
              records.forEach(function (r) {
                return push(null, r.Data.toString());
              }); // capture last SequenceNumber and store it if necessary

              if (!(lag === 0)) {
                _context.next = 18;
                break;
              }

              return _context.abrupt("return", setTimeout(next, opts.delay));

            case 18:
              return _context.abrupt("return", next());

            case 21:
              _context.prev = 21;
              _context.t0 = _context["catch"](9);
              console.warn(_context.t0.stack);
              return _context.abrupt("return", push(_context.t0, _.nil));

            case 25:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[9, 21]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};