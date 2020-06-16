"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var zlib = require("zlib");

var _ = require("highland");

var axios = require("axios");

var yaml = require("js-yaml");

var DEFAULT_BASE_URL = "http://planet.osm.org/replication/changesets/";

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
            return axios.get(`${baseURL}state.yaml`);

          case 4:
            rsp = _context.sent;
            return _context.abrupt("return", yaml.safeLoad(rsp.data).sequence);

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            throw _context.t0;

          case 11:
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
    var baseURL, state, path, rsp;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            baseURL = _ref3.baseURL;
            state = sequence.toString().padStart(9, 0);
            path = `${state.slice(0, 3)}/${state.slice(3, 6)}/${state.slice(6, 9)}`;
            _context3.next = 5;
            return axios.get(`${baseURL}${path}.osm.gz`, {
              responseType: "stream"
            });

          case 5:
            rsp = _context3.sent;
            rsp.data.sequenceNumber = sequence;
            return _context3.abrupt("return", rsp.data);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _getChange.apply(this, arguments);
}

module.exports = function (options) {
  var opts = _objectSpread({
    baseURL: DEFAULT_BASE_URL,
    checkpoint: function checkpoint() {},
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
              if (!(state == null || state < 0)) {
                _context2.next = 11;
                break;
              }

              _context2.prev = 1;
              _context2.next = 4;
              return getMostRecentReplicationSequence({
                baseURL: opts.baseURL
              });

            case 4:
              nextState = _context2.sent;

              if (state < 0) {
                state += nextState;
              } else {
                state = nextState;
              }

              _context2.next = 11;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](1);
              return _context2.abrupt("return", push(_context2.t0, _.nil));

            case 11:
              _context2.prev = 11;
              _context2.next = 14;
              return getChange(state, {
                baseURL: opts.baseURL
              });

            case 14:
              change = _context2.sent;
              push(null, change);
              opts.checkpoint(state);
              state++;
              next();
              _context2.next = 28;
              break;

            case 21:
              _context2.prev = 21;
              _context2.t1 = _context2["catch"](11);

              if (!options.infinite) {
                _context2.next = 25;
                break;
              }

              return _context2.abrupt("return", setTimeout(next, opts.delay));

            case 25:
              if (_context2.t1.response && _context2.t1.response.status === 404) {
                _context2.next = 27;
                break;
              }

              return _context2.abrupt("return", push(_context2.t1, _.nil));

            case 27:
              return _context2.abrupt("return", push(null, _.nil));

            case 28:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[1, 8], [11, 21]]);
    }));

    return function (_x4, _x5) {
      return _ref4.apply(this, arguments);
    };
  }()).map(function (s) {
    // propagate sequence number
    var s2 = s.pipe(zlib.createUnzip());
    s2.sequenceNumber = s.sequenceNumber;
    return s2;
  }).map(function (s) {
    return _(s).append(`<!-- sequenceNumber: ${s.sequenceNumber} -->\n`).append("\u001e");
  }).sequence();
};