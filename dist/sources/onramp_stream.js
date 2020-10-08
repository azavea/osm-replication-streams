"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _ = require("highland");

var AWS = require("aws-sdk");

var url = require("url");

var yaml = require("js-yaml");

var zlib = require("zlib");

var S3 = new AWS.S3();

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

function getChange(sequence, _ref3) {
  var baseURL = _ref3.baseURL;

  try {
    var sequenceStr = sequence.toString().padStart(9, '0');
    var pt1 = sequenceStr.slice(0, 3);
    var pt2 = sequenceStr.slice(3, 6);
    var pt3 = sequenceStr.slice(6, 9);
    var diffUrl = new url.URL(`${trim(baseURL, "/")}/${pt1}/${pt2}/${pt3}.xml.gz`);
    var params = {
      Bucket: diffUrl.host,
      Key: trim(diffUrl.pathname, "/")
    };
    var s3Stream = S3.getObject(params).createReadStream();
    s3Stream.sequenceNumber = sequence;
    return s3Stream;
  } catch (err) {
    console.warn(`Failed to get change ${sequence}: ${err.message}`);
    throw err;
  }
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
                _context2.next = 19;
                break;
              }

              changeStream = getChange(state, {
                baseURL: opts.baseURL
              });
              push(null, changeStream);
              state++;
              next();
              _context2.next = 22;
              break;

            case 19:
              if (!options.infinite) {
                _context2.next = 21;
                break;
              }

              return _context2.abrupt("return", setTimeout(next, opts.delay));

            case 21:
              return _context2.abrupt("return", push(null, _.nil));

            case 22:
              _context2.next = 27;
              break;

            case 24:
              _context2.prev = 24;
              _context2.t1 = _context2["catch"](0);
              return _context2.abrupt("return", setTimeout(next, opts.delay));

            case 27:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 24], [5, 9]]);
    }));

    return function (_x2, _x3) {
      return _ref4.apply(this, arguments);
    };
  }()).map(function (s) {
    var s2 = s.pipe(zlib.createGunzip());
    s2.sequenceNumber = s.sequenceNumber;
    return s2;
  }).map(function (s) {
    var startMarker = yaml.dump({
      status: "start",
      sequenceNumber: s.sequenceNumber
    });
    var endMarker = yaml.dump({
      status: "end",
      sequenceNumber: s.sequenceNumber
    });
    return _([`<!--\n${startMarker}\n-->`]).concat(s).append(`<!--\n${endMarker}\n-->`).append("\u001e");
  }).sequence();
};