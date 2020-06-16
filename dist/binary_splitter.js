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
    Transform = _require.Transform;

var BinarySplitter =
/*#__PURE__*/
function (_Transform) {
  _inherits(BinarySplitter, _Transform);

  function BinarySplitter() {
    var _this;

    var delimiter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "\n";

    _classCallCheck(this, BinarySplitter);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BinarySplitter).call(this));
    _this.delimiter = delimiter;
    _this.pending = Buffer.alloc(0);
    return _this;
  }

  _createClass(BinarySplitter, [{
    key: "_flush",
    value: function _flush(callback) {
      if (this.pending.length > 0) {
        this.push(this.pending);
      }

      return callback();
    }
  }, {
    key: "_transform",
    value: function _transform(chunk, encoding, callback) {
      var buffer = Buffer.concat([this.pending, chunk]);
      var offset = 0;

      while (offset < buffer.length) {
        var idx = buffer.indexOf(this.delimiter, offset);

        if (idx < 0) {
          break;
        }

        this.push(buffer.slice(offset, idx + 1));
        offset = idx + 1;
      }

      this.pending = buffer.slice(offset);
      return callback();
    }
  }]);

  return BinarySplitter;
}(Transform);

module.exports = BinarySplitter;