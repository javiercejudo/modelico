(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Modelico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = require('./src');

},{"./src":9}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');

var cloneViaJSON = function cloneViaJSON(x) {
  return JSON.parse(JSON.stringify(x));
};

var ModelicoAsIs = function (_Modelico) {
  _inherits(ModelicoAsIs, _Modelico);

  function ModelicoAsIs(type, value) {
    _classCallCheck(this, ModelicoAsIs);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoAsIs).call(this, type, { value: value }));

    _this.value = function () {
      return cloneViaJSON(value);
    };

    Object.freeze(_this);
    return _this;
  }

  _createClass(ModelicoAsIs, [{
    key: 'set',
    value: function set(value) {
      return new ModelicoAsIs(this.type(), value);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      return this.set(value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.value();
    }
  }], [{
    key: 'metadata',
    value: function metadata(type) {
      return Object.freeze({ type: type, reviver: U.identityReviver });
    }
  }]);

  return ModelicoAsIs;
}(Modelico);

module.exports = Object.freeze(ModelicoAsIs);

},{"./Modelico":7,"./U":8}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modelico = require('./Modelico');

var ModelicoDate = function (_Modelico) {
  _inherits(ModelicoDate, _Modelico);

  function ModelicoDate(date) {
    _classCallCheck(this, ModelicoDate);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoDate).call(this, ModelicoDate, { date: date }));

    _this.date = function () {
      return date === null ? null : new Date(date.toISOString());
    };
    Object.freeze(_this);
    return _this;
  }

  _createClass(ModelicoDate, [{
    key: 'set',
    value: function set(date) {
      return new ModelicoDate(date);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, date) {
      return this.set(date);
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

},{"./Modelico":7}],4:[function(require,module,exports){
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

    Object.freeze(_this);
    return _this;
  }

  return ModelicoEnum;
}(Modelico);

module.exports = Object.freeze(ModelicoEnum);

},{"./Modelico":7,"./U":8}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');
var AsIs = require('./AsIs').metadata;

var reviver = function reviver(itemMetadata, k, v) {
  if (k === '') {
    var list = v === null ? null : v.map(U.bind(itemMetadata.reviver, k));

    return new ModelicoList(itemMetadata, list);
  }

  return v;
};

var ModelicoList = function (_Modelico) {
  _inherits(ModelicoList, _Modelico);

  function ModelicoList(itemMetadata, list) {
    _classCallCheck(this, ModelicoList);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoList).call(this, ModelicoList, { list: list }));

    _this.itemMetadata = function () {
      return itemMetadata;
    };
    _this.list = function () {
      return list === null ? null : list.slice();
    };

    Object.freeze(_this);
    return _this;
  }

  _createClass(ModelicoList, [{
    key: 'set',
    value: function set(index, value) {
      var newList = this.list();
      newList[index] = value;

      return new ModelicoList(this.itemMetadata(), newList);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      var item = this.list()[path[0]];
      return this.set(path[0], item.setPath(path.slice(1), value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.fields().list;
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(arr) {
      return new ModelicoList(AsIs(), arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return Object.freeze({ type: ModelicoList, reviver: U.bind(reviver, itemMetadata) });
    }
  }]);

  return ModelicoList;
}(Modelico);

module.exports = Object.freeze(ModelicoList);

},{"./AsIs":2,"./Modelico":7,"./U":8}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');
var AsIs = require('./AsIs').metadata;

var stringifyMapper = function stringifyMapper(pair) {
  return { key: pair[0], value: pair[1] };
};
var reviverOrDefault = function reviverOrDefault(metadata) {
  return metadata.reviver || U.identityReviver;
};

var parseMapper = function parseMapper(subtypes) {
  return function (pairObject) {
    return [reviverOrDefault(subtypes.keyMetadata)('', pairObject.key), reviverOrDefault(subtypes.valueMetadata)('', pairObject.value)];
  };
};

var reviver = function reviver(innerTypes, k, v) {
  if (k === '') {
    var map = v === null ? null : new Map(v.map(parseMapper(innerTypes)));

    return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, map);
  }

  return v;
};

var ModelicoMap = function (_Modelico) {
  _inherits(ModelicoMap, _Modelico);

  function ModelicoMap(keyMetadata, valueMetadata, map) {
    _classCallCheck(this, ModelicoMap);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoMap).call(this, ModelicoMap, { map: map }));

    _this.innerTypes = function () {
      return Object.freeze({ keyMetadata: keyMetadata, valueMetadata: valueMetadata });
    };
    _this.map = function () {
      return map === null ? null : new Map([].concat(_toConsumableArray(map)));
    };

    Object.freeze(_this);
    return _this;
  }

  _createClass(ModelicoMap, [{
    key: 'set',
    value: function set(key, value) {
      var innerTypes = this.innerTypes();
      var newMap = this.map();
      newMap.set(key, value);

      return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      var item = this.map().get(path[0]);
      return this.set(path[0], item.setPath(path.slice(1), value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var fields = this.fields();
      return fields.map === null ? null : Array.from(fields.map).map(stringifyMapper);
    }
  }], [{
    key: 'fromObject',
    value: function fromObject(obj) {
      return ModelicoMap.fromMap(new Map(U.objToArr(obj)));
    }
  }, {
    key: 'fromMap',
    value: function fromMap(map) {
      return new ModelicoMap(AsIs(String), AsIs(), map);
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return Object.freeze({ type: ModelicoMap, reviver: U.bind(reviver, { keyMetadata: keyMetadata, valueMetadata: valueMetadata }) });
    }
  }]);

  return ModelicoMap;
}(Modelico);

module.exports = Object.freeze(ModelicoMap);

},{"./AsIs":2,"./Modelico":7,"./U":8}],7:[function(require,module,exports){
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
      return innerTypeMetadata.reviver('', v);
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

},{"./U":8}],8:[function(require,module,exports){
'use strict';

module.exports = Object.freeze({
  bind: function bind(fn, _1) {
    return fn.bind(undefined, _1);
  },
  default: function _default(optional, fallback) {
    return optional === undefined ? fallback : optional;
  },
  objToArr: function objToArr(obj) {
    return Object.keys(obj).map(function (k) {
      return [k, obj[k]];
    });
  },
  identityReviver: function identityReviver(k, v) {
    return v;
  }
});

},{}],9:[function(require,module,exports){
'use strict';

var Modelico = require('./Modelico');
var ModelicoMap = require('./Map');
var ModelicoDate = require('./Date');
var AsIs = require('./AsIs');
var List = require('./List');
var Enum = require('./Enum');

module.exports = Object.freeze({
  Modelico: Modelico,
  Map: ModelicoMap,
  Date: ModelicoDate,
  AsIs: AsIs,
  List: List,
  Enum: Enum
});

},{"./AsIs":2,"./Date":3,"./Enum":4,"./List":5,"./Map":6,"./Modelico":7}]},{},[1])(1)
});