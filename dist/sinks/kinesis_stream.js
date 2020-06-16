"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require("stream"),
    Writable = _require.Writable;

var async = require("async");

var AWS = require("aws-sdk");

var CONCURRENCY = 128;
var kinesis = new AWS.Kinesis();

var KinesisStream =
/*#__PURE__*/
function (_Writable) {
  _inherits(KinesisStream, _Writable);

  function KinesisStream(streamName) {
    var _this;

    var partitionKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, KinesisStream);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(KinesisStream).call(this));
    _this.streamName = streamName;
    _this.partitionKey = partitionKey || streamName;
    _this.pending = 0;
    return _this;
  }

  _createClass(KinesisStream, [{
    key: "_write",
    value: function _write(chunk, encoding, callback) {
      var _this2 = this;

      this.pending++;
      var blind = false;

      if (this.pending < CONCURRENCY) {
        // report successful writes preemptively
        blind = true;
        callback();
      } // TODO check chunk size to ensure that it's < 1MB


      return kinesis.putRecord({
        Data: chunk,
        PartitionKey: this.partitionKey,
        StreamName: this.streamName
      }, function (err) {
        _this2.pending--;

        if (blind && err) {
          console.warn(err);
        }

        if (!blind) {
          process.stdout.write("o");
          return callback(err);
        }

        process.stdout.write("O");
      });
    }
  }, {
    key: "_final",
    value: function _final(callback) {
      var _this3 = this;

      // wait until all pending writes have flushed
      return async.until(function () {
        return _this3.pending === 0;
      }, setImmediate, callback);
    }
  }]);

  return KinesisStream;
}(Writable);

module.exports = KinesisStream;