"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _ = require("highland");

var AWS = require("aws-sdk");

var jsYaml = require("js-yaml");

var _require = require("stream"),
    Readable = _require.Readable;

var url = require("url");

var zlib = require("zlib");

var S3 = new AWS.S3();
var EMPTY_DIFF = '<osm generator="osm-replication-streams" version="0.6"><note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note></osm>';

function trim(s, c) {
  if (c === "]") c = "\\]";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}

var getMostRecentReplicationSequence =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref) {
    var baseURL, uri, params, rsp;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            baseURL = _ref.baseURL;
            _context.prev = 1;
            uri = new url.URL(baseURL);
            params = {
              Bucket: uri.host,
              Key: `${trim(uri.pathname, "/")}/status.txt`
            };
            _context.next = 6;
            return S3.getObject(params).promise();

          case 6:
            rsp = _context.sent;
            return _context.abrupt("return", parseInt(rsp.Body, 10));

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](1);
            console.warn(`Failed to get the most recent replication sequence: ${_context.t0.message}`);
            throw _context.t0;

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 10]]);
  }));

  return function getMostRecentReplicationSequence(_x) {
    return _ref2.apply(this, arguments);
  };
}();

function getChange(_x2, _x3) {
  return _getChange.apply(this, arguments);
}

function _getChange() {
  _getChange = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(sequence, _ref3) {
    var baseURL, sequenceStr, pt1, pt2, pt3, diffUrl, params, emptyStream, s3Stream;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            baseURL = _ref3.baseURL;
            sequenceStr = sequence.toString().padStart(9, '0');
            pt1 = sequenceStr.slice(0, 3);
            pt2 = sequenceStr.slice(3, 6);
            pt3 = sequenceStr.slice(6, 9);
            diffUrl = new url.URL(`${trim(baseURL, "/")}/${pt1}/${pt2}/${pt3}.xml.gz`);
            params = {
              Bucket: diffUrl.host,
              Key: trim(diffUrl.pathname, "/")
            }; // First check if object exists because I can't figure out how to intercept a read error
            // and substitute an empty diff later when the readObject request is converted
            // with createReadStream

            _context3.prev = 7;
            _context3.next = 10;
            return S3.headObject(params).promise();

          case 10:
            _context3.next = 21;
            break;

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](7);

            if (!(_context3.t0.statusCode === 404)) {
              _context3.next = 19;
              break;
            }

            console.warn(`Found 404 for ${params}. Continuing with empty diff.`);
            emptyStream = Readable.from([EMPTY_DIFF]).pipe(zlib.createGzip());
            emptyStream.sequenceNumber = sequence;
            return _context3.abrupt("return", emptyStream);

          case 19:
            console.warn(`Failed to get change ${sequence}: ${_context3.t0.statusCode} ${_context3.t0.code}`);
            throw _context3.t0;

          case 21:
            s3Stream = S3.getObject(params).createReadStream();
            s3Stream.sequenceNumber = sequence;
            return _context3.abrupt("return", s3Stream);

          case 24:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[7, 12]]);
  }));
  return _getChange.apply(this, arguments);
}

module.exports = function (options) {
  var opts = _objectSpread({
    baseURL: undefined,
    delay: 30e3,
    infinite: true
  }, options);

  if (!opts.baseURL) {
    throw new Error('options.baseURL is required!');
  }

  if (!opts.baseURL.startsWith("s3")) {
    throw new Error('options.baseURL must be an s3 URI!');
  }

  var state = opts.initialSequence;
  return _(
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(push, next) {
      var nextState, changeStream;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return getMostRecentReplicationSequence({
                baseURL: opts.baseURL
              });

            case 3:
              nextState = _context2.sent;

              if (!(state == null || state < 0)) {
                _context2.next = 12;
                break;
              }

              _context2.prev = 5;

              if (state < 0) {
                state += nextState;
              } else {
                state = nextState;
              }

              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](5);
              return _context2.abrupt("return", push(_context2.t0, _.nil));

            case 12:
              if (!(state <= nextState)) {
                _context2.next = 21;
                break;
              }

              _context2.next = 15;
              return getChange(state, {
                baseURL: opts.baseURL
              });

            case 15:
              changeStream = _context2.sent;
              push(null, changeStream);
              state++;
              next();
              _context2.next = 24;
              break;

            case 21:
              if (!options.infinite) {
                _context2.next = 23;
                break;
              }

              return _context2.abrupt("return", setTimeout(next, opts.delay));

            case 23:
              return _context2.abrupt("return", push(null, _.nil));

            case 24:
              _context2.next = 29;
              break;

            case 26:
              _context2.prev = 26;
              _context2.t1 = _context2["catch"](0);
              return _context2.abrupt("return", setTimeout(next, opts.delay));

            case 29:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 26], [5, 9]]);
    }));

    return function (_x4, _x5) {
      return _ref4.apply(this, arguments);
    };
  }()).map(function (s) {
    var s2 = s.pipe(zlib.createGunzip());
    s2.sequenceNumber = s.sequenceNumber;
    return s2;
  }).map(function (s) {
    var startMarker = jsYaml.dump({
      status: "start",
      sequenceNumber: s.sequenceNumber
    });
    var endMarker = jsYaml.dump({
      status: "end",
      sequenceNumber: s.sequenceNumber
    });
    return _([`<!--\n${startMarker}\n-->`]).concat(s).append(`<!--\n${endMarker}\n-->`).append("\u001e");
  }).sequence();
};