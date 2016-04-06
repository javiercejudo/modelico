(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Modelico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = require('./src');

},{"./src":10}],2:[function(require,module,exports){
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
    key: 'toJSON',
    value: function toJSON() {
      return this.value();
    }
  }], [{
    key: 'buildReviver',
    value: function buildReviver(type) {
      return U.bind(ModelicoAsIs.reviver, type);
    }
  }, {
    key: 'reviver',
    value: function reviver(type, k, v) {
      return v;
    }
  }, {
    key: 'metadata',
    value: function metadata(type) {
      return Object.freeze({ type: type, reviver: ModelicoAsIs.buildReviver(type) });
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');

var ModelicoEnum = function (_Modelico) {
  _inherits(ModelicoEnum, _Modelico);

  function ModelicoEnum(fields) {
    _classCallCheck(this, ModelicoEnum);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnum).call(this, ModelicoEnum, fields));

    Object.getOwnPropertyNames(fields).forEach(function (field) {
      return _this[field]().toJSON = function () {
        return field;
      };
    });
    return _this;
  }

  _createClass(ModelicoEnum, null, [{
    key: 'buildReviver',
    value: function buildReviver(values) {
      return U.bind(ModelicoEnum.reviver, values);
    }
  }, {
    key: 'reviver',
    value: function reviver(values, k, v) {
      return v === null ? null : values[v];
    }
  }]);

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

var ModelicoList = function (_Modelico) {
  _inherits(ModelicoList, _Modelico);

  function ModelicoList(subtypeMetadata, list) {
    _classCallCheck(this, ModelicoList);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoList).call(this, ModelicoList, { list: list }));

    _this.subtype = function () {
      return subtypeMetadata;
    };
    _this.list = function () {
      return list === null ? null : list.slice();
    };

    Object.freeze(_this);
    return _this;
  }

  _createClass(ModelicoList, [{
    key: 'clone',
    value: function clone() {
      return JSON.parse(JSON.stringify(this), ModelicoList.buildReviver(this.subtype()));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.list();
    }
  }], [{
    key: 'buildReviver',
    value: function buildReviver(subtypeMetadata) {
      return U.bind(ModelicoList.reviver, subtypeMetadata);
    }
  }, {
    key: 'reviver',
    value: function reviver(subtypeMetadata, k, v) {
      if (k === '') {
        var list = v === null ? null : v.map(U.bind(subtypeMetadata.reviver, k));

        return new ModelicoList(subtypeMetadata, list);
      }

      return v;
    }
  }, {
    key: 'metadata',
    value: function metadata(subtypeMetadata) {
      return Object.freeze({ type: ModelicoList, reviver: ModelicoList.buildReviver(subtypeMetadata) });
    }
  }]);

  return ModelicoList;
}(Modelico);

module.exports = Object.freeze(ModelicoList);

},{"./Modelico":7,"./U":8}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var U = require('./U');
var Modelico = require('./Modelico');

var stringifyMapper = function stringifyMapper(pair) {
  return { key: pair[0], value: pair[1] };
};
var identityReviver = function identityReviver(k, v) {
  return v;
};
var reviverOrDefault = function reviverOrDefault(metadata) {
  return metadata.reviver || identityReviver;
};

var parseMapper = function parseMapper(subtypes) {
  return function (pairObject) {
    return [reviverOrDefault(subtypes.keyMetadata)('', pairObject.key), reviverOrDefault(subtypes.valueMetadata)('', pairObject.value)];
  };
};

var ModelicoMap = function (_Modelico) {
  _inherits(ModelicoMap, _Modelico);

  function ModelicoMap(keyMetadata, valueMetadata, map) {
    _classCallCheck(this, ModelicoMap);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoMap).call(this, ModelicoMap, { map: map }));

    _this.subtypes = function () {
      return Object.freeze({ keyMetadata: keyMetadata, valueMetadata: valueMetadata });
    };

    Object.freeze(_this);
    return _this;
  }

  _createClass(ModelicoMap, [{
    key: 'clone',
    value: function clone() {
      return JSON.parse(JSON.stringify(this), U.bind(ModelicoMap.reviver, this.subtypes()));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.map() === null ? null : Array.from(this.map()).map(stringifyMapper);
    }
  }], [{
    key: 'buildReviver',
    value: function buildReviver(keyMetadata, valueMetadata) {
      return U.bind(ModelicoMap.reviver, { keyMetadata: keyMetadata, valueMetadata: valueMetadata });
    }
  }, {
    key: 'reviver',
    value: function reviver(subtypes, k, v) {
      if (k === '') {
        var map = v === null ? null : new Map(v.map(parseMapper(subtypes)));

        return new ModelicoMap(subtypes.keyMetadata, subtypes.valueMetadata, map);
      }

      return v;
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return Object.freeze({ type: ModelicoMap, reviver: ModelicoMap.buildReviver(keyMetadata, valueMetadata) });
    }
  }]);

  return ModelicoMap;
}(Modelico);

module.exports = Object.freeze(ModelicoMap);

},{"./Modelico":7,"./U":8}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var U = require('./U');

var assignReducer = function assignReducer(acc, pair) {
  acc[pair.field] = pair.value;

  return acc;
};

var Modelico = function () {
  function Modelico(Type, fields) {
    var _this = this;

    _classCallCheck(this, Modelico);

    this.type = function () {
      return Type;
    };
    this.fields = function () {
      return Object.freeze(fields);
    };

    Object.getOwnPropertyNames(fields).forEach(function (field) {
      return _this[field] = function () {
        return fields[field];
      };
    });
  }

  _createClass(Modelico, [{
    key: 'set',
    value: function set(field, value) {
      var newFields = Object.assign({}, this.clone().fields(), assignReducer({}, { field: field, value: value }));
      var newInstance = new Modelico(this.type(), newFields);

      return Object.freeze(newInstance);
    }
  }, {
    key: 'clone',
    value: function clone() {
      return Modelico.fromJSON(this.type(), JSON.stringify(this));
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
    key: 'fromJSON',
    value: function fromJSON(Type, json) {
      return JSON.parse(json, Modelico.buildReviver(Type));
    }
  }, {
    key: 'buildReviver',
    value: function buildReviver(Type) {
      if (Type.hasOwnProperty('reviver')) {
        return Type.reviver;
      }

      return U.bind(Modelico.reviver, Type);
    }
  }, {
    key: 'reviver',
    value: function reviver(Type, k, v) {
      if (k === '') {
        return new Type(v);
      }

      var subtypeMetadata = Type.subtypes()[k];

      if (subtypeMetadata) {
        return subtypeMetadata.reviver('', v);
      }

      return v;
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
  }
});

},{}],9:[function(require,module,exports){
'use strict';

var ModelicoEnum = require('./Enum');

var valuesReducer = function valuesReducer(acc, code) {
  return (acc[code] = { code: code }) && acc;
};

module.exports = function (values) {
  var valuesAsObject = Array.isArray(values) ? values.reduce(valuesReducer, {}) : values;

  var myEnum = new ModelicoEnum(valuesAsObject);

  myEnum.reviver = ModelicoEnum.buildReviver(valuesAsObject);
  myEnum.metadata = function () {
    return Object.freeze({ type: ModelicoEnum, reviver: myEnum.reviver });
  };

  return Object.freeze(myEnum);
};

},{"./Enum":4}],10:[function(require,module,exports){
'use strict';

var Modelico = require('./Modelico');
var ModelicoMap = require('./Map');
var ModelicoDate = require('./Date');
var AsIs = require('./AsIs');
var List = require('./List');
var Enum = require('./Enum');
var enumFactory = require('./enumFactory');

module.exports = Object.freeze({
  Modelico: Modelico,
  Map: ModelicoMap,
  Date: ModelicoDate,
  AsIs: AsIs,
  List: List,
  Enum: Enum,
  enumFactory: enumFactory
});

},{"./AsIs":2,"./Date":3,"./Enum":4,"./List":5,"./Map":6,"./Modelico":7,"./enumFactory":9}]},{},[1])(1)
});