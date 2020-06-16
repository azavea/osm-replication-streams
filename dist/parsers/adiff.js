"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require("stream"),
    Transform = _require.Transform;

var _require2 = require("@turf/helpers"),
    featureCollection = _require2.featureCollection,
    lineString = _require2.lineString,
    point = _require2.point,
    polygon = _require2.polygon;

require("array-flat-polyfill"); // Remove when support dropped for Node < 11


var _require3 = require("htmlparser2"),
    Parser = _require3.Parser;

var _require4 = require("id-area-keys"),
    isArea = _require4.isArea;

var yaml = require("js-yaml");

var isEqual = require("lodash.isequal");

var osmtogeojson = require("osmtogeojson");

var _require5 = require("xmldom"),
    DOMParser = _require5.DOMParser;

var isClosed = function isClosed(coords) {
  return isEqual(coords[0], coords[coords.length - 1]);
};

var xmlAttrsToString = function xmlAttrsToString(attributes) {
  return Object.entries(attributes).reduce(function (xmlStr, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return `${xmlStr} ${key}="${value}" `;
  }, "");
};

var emptyGeometry = {
  type: "GeometryCollection",
  geometries: []
};

var toGeoJSON = function toGeoJSON(id, element, prev) {
  var tags = element.tags;
  var visible = element.visible !== "false";

  if (!visible) {
    tags = prev.tags;
  }

  switch (element.type) {
    case "relation":
      {
        var changeset = element.changeset,
            members = element.members,
            timestamp = element.timestamp,
            uid = element.uid,
            user = element.user,
            version = element.version;
        var geometry; // Use previous geometry if the element has been deleted

        if (prev && prev.geometry && !element.geometry) {
          // eslint-disable-next-line prefer-destructuring
          geometry = prev.geometry;
        } else if (element.geometry) {
          // eslint-disable-next-line prefer-destructuring
          geometry = element.geometry;
        } else {
          geometry = Object.assign({}, emptyGeometry);
        }

        var properties = {
          id: element.id,
          changeset,
          members,
          tags,
          timestamp,
          type: "relation",
          uid,
          user,
          version,
          visible
        }; // Return a native geojson object rather than a specific turf.js one. We're relying on
        // osmtogeojson to have constructed the proper geometry for us based on the available tags.

        return {
          id,
          geometry,
          properties,
          type: "Feature"
        };
      }

    case "node":
      {
        var coords = [element.lon, element.lat]; // use previous coords if the element has been deleted

        if (element.lat == null && element.lon == null) {
          coords = [prev.lon, prev.lat];
        }

        return point(coords, {
          changeset: element.changeset,
          id: element.id,
          tags,
          timestamp: element.timestamp,
          type: element.type,
          uid: element.uid,
          user: element.user,
          version: element.version,
          visible
        }, {
          id
        });
      }

    case "way":
      {
        var _coords = element.nodes.map(function (x) {
          return [x.lon, x.lat];
        });

        if (element.nodes.length === 0) {
          _coords = prev.nodes.map(function (x) {
            return [x.lon, x.lat];
          });
        }

        var nds = element.nodes.map(function (x) {
          return x.id || x.ref;
        });
        var _properties = {
          changeset: element.changeset,
          id: element.id,
          nds,
          tags,
          timestamp: element.timestamp,
          type: element.type,
          uid: element.uid,
          user: element.user,
          version: element.version,
          visible
        };

        if (_coords.flat().some(function (x) {
          return x == null;
        })) {
          // invalid geometry
          return {
            id,
            type: "Feature",
            geometry: Object.assign({}, emptyGeometry),
            properties: _properties
          };
        }

        if (isClosed(_coords) && isArea(element.tags) && _coords.length >= 4) {
          return polygon([_coords], _properties, {
            id
          });
        }

        if (_coords.length >= 2) {
          return lineString(_coords, _properties, {
            id
          });
        }

        return point(_coords[0], _properties, {
          id
        });
      }

    default:
  }
};

module.exports =
/*#__PURE__*/
function (_Transform) {
  _inherits(AugmentedDiffParser, _Transform);

  function AugmentedDiffParser() {
    var _this;

    _classCallCheck(this, AugmentedDiffParser);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AugmentedDiffParser).call(this, {
      readableObjectMode: true
    }));
    _this.sequence = null;
    _this.timestamp = null;

    _this.createParser();

    return _this;
  }

  _createClass(AugmentedDiffParser, [{
    key: "createParser",
    value: function createParser() {
      var _this2 = this;

      this.parser = new Parser({
        onopentag: this.startElement.bind(this),
        onclosetag: this.endElement.bind(this),
        oncomment: function oncomment(comment) {
          try {
            var data = yaml.safeLoad(comment);

            if (data.status === "start") {
              _this2.sequence = data.sequenceNumber; // Overpass sequences are minute offsets from 2012-09-12T06:55:00.000Z

              _this2.timestamp = new Date((_this2.sequence * 60 + 1347432900) * 1000);

              _this2.emit("sequenceStart", _this2.sequence);
            }

            if (data.status === "end") {
              _this2.emit("sequenceEnd", _this2.sequence);

              _this2.parser.reset();

              _this2.sequence = null;
              _this2.timestamp = null;
            } // push a marker into the stream


            _this2.push({
              type: "Marker",
              properties: data
            });
          } catch (err) {// not yaml
          }
        },
        onerror: function onerror(err) {
          return console.warn(err) && _this2.emit("error", err);
        }
      }, {
        xmlMode: true
      }); // write a synthetic root element to facilitate parsing of multiple
      // documents

      this.parser.write("<root>");
    }
  }, {
    key: "_transform",
    value: function _transform(chunk, encoding, callback) {
      this.parser.write(chunk);
      return callback();
    }
  }, {
    key: "startElement",
    value: function startElement(name, attributes) {
      switch (name) {
        case "osm":
          this.nodes = {
            old: {},
            new: {}
          };
          this.ways = {
            old: {},
            new: {}
          };
          this.relations = {
            old: {},
            new: {}
          };
          this.nds = {};
          break;

        case "action":
          this.action = attributes.type;

          if (this.action === "create") {
            this.state = "new";
          }

          break;

        case "old":
        case "new":
          this.state = name;
          break;

        case "node":
          {
            var lat = attributes.lat,
                lon = attributes.lon;
            this[this.state] = _objectSpread({}, attributes, {
              lat: lat ? Number(lat) : null,
              lon: lon ? Number(lon) : null,
              tags: {},
              type: name
            });
            break;
          }

        case "way":
          this[this.state] = _objectSpread({}, attributes, {
            nodes: [],
            tags: {},
            type: name
          });
          break;

        case "relation":
          this[this.state] = _objectSpread({}, attributes, {
            geometry: undefined,
            members: [],
            tags: {},
            type: name,
            xml: `<relation ${xmlAttrsToString(attributes)}>`
          });
          break;

        case "member":
          {
            var element = this[this.state];

            if (element.type === "relation") {
              element.members.push(attributes);
              var attrs = xmlAttrsToString(attributes);
              element.xml += `<member ${attrs}>`;
            }

            break;
          }

        case "tag":
          this[this.state].tags = _objectSpread({}, this[this.state].tags, {
            [attributes.k]: attributes.v
          });
          break;

        case "nd":
          {
            var _element = this[this.state];

            switch (_element.type) {
              case "way":
                {
                  var ref = attributes.ref,
                      _lat = attributes.lat,
                      _lon = attributes.lon;
                  var nd = {
                    ref,
                    lat: _lat ? Number(_lat) : null,
                    lon: _lon ? Number(_lon) : null
                  };
                  _element.nodes = [].concat(_toConsumableArray(_element.nodes), [nd]);
                  break;
                }

              case "relation":
                _element.xml += `<nd ${xmlAttrsToString(attributes)}/>`;
                break;

              default:
            }

            break;
          }

        default:
      }
    }
  }, {
    key: "endElement",
    value: function endElement(name) {
      var _this3 = this;

      switch (name) {
        case "action":
          {
            // cache elements for lookups when reconstructing ways + relations
            // (duplicates old/new endElement because creates don't fire them)
            var element = this[this.state];
            this[`${element.type}s`][this.state][element.id] = this[this.state];
            var prev = this.old,
                next = this.new;

            if (["node", "way", "relation"].includes(next.type)) {
              if (prev == null) {
                try {
                  var ng = toGeoJSON("new", next);

                  if (this.sequence != null) {
                    ng.properties.augmentedDiff = this.sequence;
                  }

                  this.push(featureCollection([ng], {
                    id: this.action
                  }));
                } catch (err) {
                  console.warn(err.stack);
                }
              } else {
                if (prev.version === next.version || Date.parse(next.timestamp) < this.timestamp - 60e3) {
                  // node 35989826 was modified, changing way 5187240, which should show as version 3 before and after
                  // http://overpass-api.de/api/augmented_diff?id=2853595
                  this.action = "minorVersion"; // prev.changeset is the last *major* version
                  // next.changeset is the current *major* version

                  if (next.type === "way") {
                    var nodeMeta = next.nodes // filter out nodes not included in this diff
                    .filter(function (x) {
                      return x.timestamp;
                    }).sort(function (a, b) {
                      return Date.parse(a.timestamp) - Date.parse(b.timestamp);
                    });

                    if (nodeMeta.length === 0) {
                      // see way 17641595 (version 2 -> 3) in
                      // http://overpass-api.de/api/augmented_diff?id=2801986
                      // tags change but the new way doesn't reflect the new version
                      return;
                    } // assign the correct metadata


                    var meta = nodeMeta.pop();
                    next.changeset = meta.changeset;
                    next.uid = meta.uid;
                    next.user = meta.user;
                    next.timestamp = meta.timestamp;
                  }
                }

                try {
                  var og = toGeoJSON("old", prev);

                  var _ng = toGeoJSON("new", next, prev);

                  if (this.sequence != null) {
                    _ng.properties.augmentedDiff = this.sequence;
                  }

                  this.push(featureCollection([og, _ng], {
                    id: this.action
                  }));
                } catch (err) {
                  console.warn(err.stack);
                }
              }
            }

            this.state = null;
            this.old = null;
            this.new = null;
            break;
          }

        case "old":
        case "new":
          {
            // cache elements for lookups when reconstructing ways + relations
            var _element2 = this[this.state];
            this[`${_element2.type}s`][this.state][_element2.id] = this[this.state];
            break;
          }

        case "way":
          {
            var _element3 = this[this.state];
            _element3.nodes = _element3.nodes.map(function (n) {
              var node = _this3.nodes[_this3.state][n.ref] || n; // if the node was deleted, use the old version so we have geometry
              // information

              if (_this3.state === "new" && node.visible === "false") {
                node = _this3.nodes.old[n.ref] || n;
              }

              return node;
            });
            break;
          }

        case "relation":
          {
            var _element4 = this[this.state]; // Need tags in xml so that osmtogeojson can properly detect areas

            var tags = Object.entries(_element4.tags).reduce(function (tagStr, _ref3) {
              var _ref4 = _slicedToArray(_ref3, 2),
                  key = _ref4[0],
                  value = _ref4[1];

              return `${tagStr}<tag k="${key}" v="${value}"/>`;
            }, "");
            _element4.xml += `${tags}</relation>`;
            var parser = new DOMParser();
            var fc = osmtogeojson(parser.parseFromString(_element4.xml, "text/xml"), {
              uninterestingTags: {}
            });

            if (fc.features.length && fc.features[0].geometry) {
              _element4.geometry = fc.features[0].geometry;
            }

            delete _element4.xml;
            break;
          }

        case "member":
          {
            var _element5 = this[this.state];

            if (_element5.type === "relation") {
              _element5.xml += "</member>";
            }

            break;
          }

        default:
      }
    }
  }]);

  return AugmentedDiffParser;
}(Transform);