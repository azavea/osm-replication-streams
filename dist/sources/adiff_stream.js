"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _ = require("highland");

var axios = require("axios");

var yaml = require("js-yaml");

var OVERPASS_URL = "http://overpass-api.de";

var getMostRecentReplicationSequence =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref) {
    var baseURL, rsp;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            baseURL = _ref.baseURL;
            _context.prev = 1;
            _context.next = 4;
            return axios.get(`${baseURL}/api/augmented_diff_status`);

          case 4:
            rsp = _context.sent;
            return _context.abrupt("return", parseInt(rsp.data, 10));

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            console.warn(`Failed to get the most recent replication sequence: ${_context.t0.message}`);
            throw _context.t0;

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 8]]);
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
    var baseURL, rsp;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            baseURL = _ref3.baseURL;
            _context3.prev = 1;
            _context3.next = 4;
            return axios.get(`${baseURL}/api/augmented_diff?id=${sequence}`, {
              responseType: "stream",
              timeout: 60e3
            });

          case 4:
            rsp = _context3.sent;
            rsp.data.sequenceNumber = sequence;
            return _context3.abrupt("return", rsp.data);

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](1);
            console.warn(`Failed to get change ${sequence}: ${_context3.t0.message}`);
            throw _context3.t0;

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 9]]);
  }));
  return _getChange.apply(this, arguments);
}

module.exports = function (options) {
  var opts = _objectSpread({
    baseURL: OVERPASS_URL,
    delay: 30e3,
    infinite: true
  }, options);

  var state = opts.initialSequence;
  return _(
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(push, next) {
      var nextState, change;
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
              change = _context2.sent;
              push(null, change);
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