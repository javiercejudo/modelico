(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Modelico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = require('./src');

},{"./src":13}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');

var AbstractMap = function (_Modelico) {
  _inherits(AbstractMap, _Modelico);

  function AbstractMap(Type, keyMetadata, valueMetadata, innerMap) {
    var _ret;

    _classCallCheck(this, AbstractMap);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AbstractMap).call(this, Type, { innerMap: innerMap }));

    _this.innerTypes = function () {
      return Object.freeze({ keyMetadata: keyMetadata, valueMetadata: valueMetadata });
    };
    _this.innerMap = function () {
      return innerMap === null ? null : new Map(innerMap);
    };

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AbstractMap, [{
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return value;
      }

      var item = this.innerMap().get(path[0]);
      return this.set(path[0], item.setPath(path.slice(1), value));
    }

    // as static to support IE < 11

  }], [{
    key: 'set',
    value: function set(Type, key, value) {
      var innerTypes = this.innerTypes();
      var newMap = this.innerMap();
      newMap.set(key, value);

      return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
    }
  }, {
    key: 'metadata',
    value: function metadata(Type, reviver, keyMetadata, valueMetadata) {
      return Object.freeze({ type: Type, reviver: U.bind(reviver, { keyMetadata: keyMetadata, valueMetadata: valueMetadata }) });
    }
  }]);

  return AbstractMap;
}(Modelico);

module.exports = Object.freeze(AbstractMap);

},{"./Modelico":10,"./U":12}],3:[function(require,module,exports){
'use strict';

module.exports = Object.freeze({});

},{}],4:[function(require,module,exports){
'use strict';

var U = require('./U');

module.exports = function (type) {
  return Object.freeze({ type: type, reviver: U.asIsReviver });
};

},{"./U":12}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modelico = require('./Modelico');

var ModelicoDate = function (_Modelico) {
  _inherits(ModelicoDate, _Modelico);

  function ModelicoDate(date) {
    var _ret;

    _classCallCheck(this, ModelicoDate);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoDate).call(this, ModelicoDate, { date: date }));

    _this.date = function () {
      return date === null ? null : new Date(date.toISOString());
    };

    return _ret = Object.freeze(_this), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ModelicoDate, [{
    key: 'set',
    value: function set(date) {
      return new ModelicoDate(date);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return value;
      }

      return this.set(value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.date() === null ? null : this.date().toISOString();
    }
  }], [{
    key: 'reviver',
    value: function reviver(k, v) {
      var date = v === null ? null : new Date(v);

      return new ModelicoDate(date);
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return Object.freeze({ type: ModelicoDate, reviver: ModelicoDate.reviver });
    }
  }]);

  return ModelicoDate;
}(Modelico);

module.exports = Object.freeze(ModelicoDate);

},{"./Modelico":10}],6:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');

var enumeratorsReducer = function enumeratorsReducer(acc, code) {
  return (acc[code] = { code: code }) && acc;
};

var reviver = function reviver(values, k, v) {
  return v === null ? null : values[v];
};

var ModelicoEnum = function (_Modelico) {
  _inherits(ModelicoEnum, _Modelico);

  function ModelicoEnum(input) {
    var _ret;

    _classCallCheck(this, ModelicoEnum);

    var enumerators = Array.isArray(input) ? input.reduce(enumeratorsReducer, {}) : input;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnum).call(this, ModelicoEnum, enumerators));

    Object.getOwnPropertyNames(enumerators).forEach(function (enumerator) {
      return _this[enumerator]().toJSON = function () {
        return enumerator;
      };
    });

    _this.metadata = function () {
      return Object.freeze({
        type: ModelicoEnum,
        reviver: U.bind(reviver, enumerators)
      });
    };

    return _ret = Object.freeze(_this), _possibleConstructorReturn(_this, _ret);
  }

  return ModelicoEnum;
}(Modelico);

module.exports = Object.freeze(ModelicoEnum);

},{"./Modelico":10,"./U":12}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var AbstractMap = require('./AbstractMap');

var stringifyReducer = function stringifyReducer(acc, pair) {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

var parseMapper = function parseMapper(innerTypes, object) {
  return function (enumerator) {
    return [U.reviverOrAsIs(innerTypes.keyMetadata)('', enumerator), U.reviverOrAsIs(innerTypes.valueMetadata)('', object[enumerator])];
  };
};

var reviver = function reviver(innerTypes, k, v) {
  if (k !== '') {
    return v;
  }

  var innerMap = v === null ? null : new Map(Object.keys(v).map(parseMapper(innerTypes, v)));

  return new ModelicoEnumMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
};

var ModelicoEnumMap = function (_AbstractMap) {
  _inherits(ModelicoEnumMap, _AbstractMap);

  function ModelicoEnumMap(keyMetadata, valueMetadata, innerMap) {
    var _ret;

    _classCallCheck(this, ModelicoEnumMap);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnumMap).call(this, ModelicoEnumMap, keyMetadata, valueMetadata, innerMap));

    return _ret = Object.freeze(_this), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ModelicoEnumMap, [{
    key: 'set',
    value: function set(enumerator, value) {
      return AbstractMap.set.call(this, ModelicoEnumMap, enumerator, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var innerMap = this.fields().innerMap;

      return innerMap === null ? null : Array.from(innerMap).reduce(stringifyReducer, {});
    }
  }], [{
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return AbstractMap.metadata(ModelicoEnumMap, reviver, keyMetadata, valueMetadata);
    }
  }]);

  return ModelicoEnumMap;
}(AbstractMap);

module.exports = Object.freeze(ModelicoEnumMap);

},{"./AbstractMap":2,"./U":12}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');
var AsIs = require('./AsIs');
var Any = require('./Any');

var ModelicoList = function (_Modelico) {
  _inherits(ModelicoList, _Modelico);

  function ModelicoList(itemMetadata, innerList) {
    var _ret;

    _classCallCheck(this, ModelicoList);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoList).call(this, ModelicoList, { innerList: innerList }));

    _this.itemMetadata = function () {
      return itemMetadata;
    };
    _this.innerList = function () {
      return innerList === null ? null : innerList.slice();
    };

    return _ret = Object.freeze(_this), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ModelicoList, [{
    key: 'set',
    value: function set(index, value) {
      var newList = this.innerList();
      newList[index] = value;

      return new ModelicoList(this.itemMetadata(), newList);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return value;
      }

      var item = this.innerList()[path[0]];

      return this.set(path[0], item.setPath(path.slice(1), value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.fields().innerList;
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(arr) {
      return new ModelicoList(AsIs(Any), arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return U.iterableMetadata(ModelicoList, itemMetadata);
    }
  }]);

  return ModelicoList;
}(Modelico);

module.exports = Object.freeze(ModelicoList);

},{"./Any":3,"./AsIs":4,"./Modelico":10,"./U":12}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var AbstractMap = require('./AbstractMap');
var AsIs = require('./AsIs');
var Any = require('./Any');

var stringifyMapper = function stringifyMapper(pair) {
  return { key: pair[0], value: pair[1] };
};

var parseMapper = function parseMapper(innerTypes) {
  return function (pairObject) {
    return [U.reviverOrAsIs(innerTypes.keyMetadata)('', pairObject.key), U.reviverOrAsIs(innerTypes.valueMetadata)('', pairObject.value)];
  };
};

var reviver = function reviver(innerTypes, k, v) {
  if (k !== '') {
    return v;
  }

  var innerMap = v === null ? null : new Map(v.map(parseMapper(innerTypes)));

  return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
};

var ModelicoMap = function (_AbstractMap) {
  _inherits(ModelicoMap, _AbstractMap);

  function ModelicoMap(keyMetadata, valueMetadata, innerMap) {
    var _ret;

    _classCallCheck(this, ModelicoMap);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoMap).call(this, ModelicoMap, keyMetadata, valueMetadata, innerMap));

    return _ret = Object.freeze(_this), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ModelicoMap, [{
    key: 'set',
    value: function set(enumerator, value) {
      return AbstractMap.set.call(this, ModelicoMap, enumerator, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var innerMap = this.fields().innerMap;

      return innerMap === null ? null : Array.from(innerMap).map(stringifyMapper);
    }
  }], [{
    key: 'fromObject',
    value: function fromObject(obj) {
      return ModelicoMap.fromMap(new Map(U.objToArr(obj)));
    }
  }, {
    key: 'fromMap',
    value: function fromMap(map) {
      return new ModelicoMap(AsIs(String), AsIs(Any), map);
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return AbstractMap.metadata(ModelicoMap, reviver, keyMetadata, valueMetadata);
    }
  }]);

  return ModelicoMap;
}(AbstractMap);

module.exports = Object.freeze(ModelicoMap);

},{"./AbstractMap":2,"./Any":3,"./AsIs":4,"./U":12}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var U = require('./U');

var assignReducer = function assignReducer(acc, pair) {
  acc[pair.field] = pair.value;

  return acc;
};

var reviver = function reviver(Type, k, v) {
  if (k === '') {
    return new Type(v);
  }

  if (Type.innerTypes) {
    var innerTypeMetadata = Type.innerTypes()[k];

    if (innerTypeMetadata) {
      return U.reviverOrAsIs(innerTypeMetadata)('', v);
    }
  }

  return v;
};

var Modelico = function () {
  function Modelico(Type, fields, thisArg) {
    _classCallCheck(this, Modelico);

    thisArg = U.default(thisArg, this);
    thisArg.type = function () {
      return Type;
    };
    thisArg.fields = function () {
      return Object.freeze(fields);
    };

    Object.getOwnPropertyNames(fields).forEach(function (field) {
      return thisArg[field] = function () {
        return fields[field];
      };
    });

    return thisArg;
  }

  _createClass(Modelico, [{
    key: 'set',
    value: function set(field, value) {
      var newFields = Object.assign({}, this.fields(), assignReducer({}, { field: field, value: value }));
      var Type = this.type();

      return new Type(newFields);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return value;
      }

      if (path.length === 1) {
        return this.set(path[0], value);
      }

      return this.set(path[0], this[path[0]]().setPath(path.slice(1), value));
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return JSON.stringify(this) === JSON.stringify(other);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.fields();
    }
  }], [{
    key: 'factory',
    value: function factory(Type, fields, thisArg) {
      return new Modelico(Type, fields, thisArg);
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(Type, json) {
      return JSON.parse(json, U.bind(reviver, Type));
    }
  }, {
    key: 'metadata',
    value: function metadata(Type) {
      return Object.freeze({ type: Type, reviver: U.bind(reviver, Type) });
    }
  }]);

  return Modelico;
}();

module.exports = Object.freeze(Modelico);

},{"./U":12}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');
var AsIs = require('./AsIs');
var Any = require('./Any');

var ModelicoSet = function (_Modelico) {
  _inherits(ModelicoSet, _Modelico);

  function ModelicoSet(itemMetadata, innerSet) {
    var _ret;

    _classCallCheck(this, ModelicoSet);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoSet).call(this, ModelicoSet, { innerSet: innerSet }));

    _this.itemMetadata = function () {
      return itemMetadata;
    };
    _this.innerSet = function () {
      return innerSet === null ? null : new Set(innerSet);
    };

    return _ret = Object.freeze(_this), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ModelicoSet, [{
    key: 'set',
    value: function set(index, value) {
      var newSet = Array.from(this.innerSet());
      newSet[index] = value;

      return new ModelicoSet(this.itemMetadata(), newSet);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return value;
      }

      var item = Array.from(this.innerSet())[path[0]];

      return this.set(path[0], item.setPath(path.slice(1), value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var innerSet = this.fields().innerSet;

      return innerSet === null ? null : Array.from(innerSet);
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(arr) {
      return new ModelicoSet(AsIs(Any), arr);
    }
  }, {
    key: 'fromSet',
    value: function fromSet(arr) {
      return new ModelicoSet(AsIs(Any), arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return U.iterableMetadata(ModelicoSet, itemMetadata);
    }
  }]);

  return ModelicoSet;
}(Modelico);

module.exports = Object.freeze(ModelicoSet);

},{"./Any":3,"./AsIs":4,"./Modelico":10,"./U":12}],12:[function(require,module,exports){
'use strict';

var proxyToInner = require('./proxyToInner');

var asIsReviver = function asIsReviver(k, v) {
  return v;
};
var bind = function bind(fn, _1) {
  return fn.bind(undefined, _1);
};

var iterableReviver = function iterableReviver(IterableType, itemMetadata, k, v) {
  if (k !== '') {
    return v;
  }

  var iterable = v === null ? null : v.map(bind(itemMetadata.reviver, k));

  return new IterableType(itemMetadata, iterable);
};

var iterableMetadata = function iterableMetadata(IterableType, itemMetadata, k, v) {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviver.bind(undefined, IterableType, itemMetadata)
  });
};

module.exports = Object.freeze({
  bind: bind,
  default: function _default(optional, fallback) {
    return optional === undefined ? fallback : optional;
  },
  objToArr: function objToArr(obj) {
    return Object.keys(obj).map(function (k) {
      return [k, obj[k]];
    });
  },
  reviverOrAsIs: function reviverOrAsIs(metadata) {
    return metadata.reviver || asIsReviver;
  },
  asIsReviver: asIsReviver,
  iterableReviver: iterableReviver,
  iterableMetadata: iterableMetadata,
  proxyToInner: proxyToInner
});

},{"./proxyToInner":14}],13:[function(require,module,exports){
'use strict';

var Modelico = require('./Modelico');
var ModelicoMap = require('./Map');
var EnumMap = require('./EnumMap');
var ModelicoDate = require('./Date');
var AsIs = require('./AsIs');
var List = require('./List');
var ModelicoSet = require('./Set');
var Enum = require('./Enum');
var Any = require('./Any');
var U = require('./U');

module.exports = Object.freeze({
  Modelico: Modelico,
  Map: ModelicoMap,
  EnumMap: EnumMap,
  Date: ModelicoDate,
  AsIs: AsIs,
  Any: Any,
  List: List,
  Set: ModelicoSet,
  Enum: Enum,
  proxyMap: U.bind(U.proxyToInner, 'innerMap'),
  proxyList: U.bind(U.proxyToInner, 'innerList'),
  proxySet: U.bind(U.proxyToInner, 'innerSet'),
  proxyDate: U.bind(U.proxyToInner, 'date')
});

},{"./Any":3,"./AsIs":4,"./Date":5,"./Enum":6,"./EnumMap":7,"./List":8,"./Map":9,"./Modelico":10,"./Set":11,"./U":12}],14:[function(require,module,exports){
'use strict';

var proxyToInner = function proxyToInner(innerAccessor, obj) {
  var get = function get(target, prop) {
    if (prop in target) {
      return target[prop];
    }

    var inner = target[innerAccessor]();
    var candidate = inner[prop];

    if (typeof candidate === 'function') {
      return candidate.bind(inner);
    }

    return candidate;
  };

  // not using shortcut get due to https://github.com/nodejs/node/issues/4237
  return new Proxy(obj, { get: get });
};

module.exports = proxyToInner;

},{}]},{},[1])(1)
});