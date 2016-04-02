(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Modelico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint node:true, esnext: true */

'use strict';

var Modelico = require('./src/Modelico');
var ModelicoPrimitive = require('./src/Primitive');
var ModelicoMap = require('./src/Map');
var ModelicoList = require('./src/List');
var ModelicoEnum = require('./src/Enum');
var ModelicoDate = require('./src/Date');
var enumFactory = require('./src/enumFactory');

module.exports = {
  Modelico: Modelico,
  ModelicoPrimitive: ModelicoPrimitive,
  ModelicoMap: ModelicoMap,
  ModelicoList: ModelicoList,
  ModelicoDate: ModelicoDate,
  ModelicoEnum: ModelicoEnum,
  enumFactory: enumFactory
};

},{"./src/Date":2,"./src/Enum":3,"./src/List":4,"./src/Map":5,"./src/Modelico":6,"./src/Primitive":7,"./src/enumFactory":8}],2:[function(require,module,exports){
/*jshint node:true, esnext:true */

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

      return Object.freeze(new ModelicoDate(date));
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return { type: ModelicoDate, reviver: ModelicoDate.reviver };
    }
  }]);

  return ModelicoDate;
}(Modelico);

module.exports = ModelicoDate;

},{"./Modelico":6}],3:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    key: 'reviver',
    value: function reviver(values, k, v) {
      return v === null ? null : values[v];
    }
  }]);

  return ModelicoEnum;
}(Modelico);

module.exports = ModelicoEnum;

},{"./Modelico":6}],4:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modelico = require('./Modelico');
var ModelicoPrimitive = require('./Primitive');

var ModelicoList = function (_Modelico) {
  _inherits(ModelicoList, _Modelico);

  function ModelicoList(subtypeMetadata, list) {
    _classCallCheck(this, ModelicoList);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoList).call(this, ModelicoList, { list: list }));

    _this.subtype = function () {
      return subtypeMetadata;
    };
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
      return ModelicoList.reviver.bind(undefined, subtypeMetadata);
    }
  }, {
    key: 'reviver',
    value: function reviver(subtypeMetadata, k, v) {
      if (k === '') {
        var list = v === null ? null : v.map(subtypeMetadata.reviver.bind(undefined, ''));

        return Object.freeze(new ModelicoList(subtypeMetadata, list));
      }

      return v;
    }
  }, {
    key: 'metadata',
    value: function metadata(subtypeMetadata) {
      return { type: ModelicoList, reviver: ModelicoList.buildReviver(subtypeMetadata) };
    }
  }]);

  return ModelicoList;
}(Modelico);

module.exports = ModelicoList;

},{"./Modelico":6,"./Primitive":7}],5:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modelico = require('./Modelico');

var stringifyMapper = function stringifyMapper(pair) {
  return { key: pair[0], value: pair[1] };
};

var parseMapper = function parseMapper(subtypes) {
  return function (pairObject) {
    return [subtypes.keyMetadata.reviver('', pairObject.key), subtypes.valueMetadata.reviver('', pairObject.value)];
  };
};

var ModelicoMap = function (_Modelico) {
  _inherits(ModelicoMap, _Modelico);

  function ModelicoMap(keyMetadata, valueMetadata, map) {
    _classCallCheck(this, ModelicoMap);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoMap).call(this, ModelicoMap, { map: map }));

    _this.subtypes = function () {
      return { keyMetadata: keyMetadata, valueMetadata: valueMetadata };
    };
    return _this;
  }

  _createClass(ModelicoMap, [{
    key: 'clone',
    value: function clone() {
      return JSON.parse(JSON.stringify(this), ModelicoMap.reviver.bind(undefined, this.subtypes()));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.map() === null ? null : Array.from(this.map()).map(stringifyMapper);
    }
  }], [{
    key: 'buildReviver',
    value: function buildReviver(keyMetadata, valueMetadata) {
      return ModelicoMap.reviver.bind(undefined, { keyMetadata: keyMetadata, valueMetadata: valueMetadata });
    }
  }, {
    key: 'reviver',
    value: function reviver(subtypes, k, v) {
      if (k === '') {
        var map = v === null ? null : new Map(v.map(parseMapper(subtypes)));

        return Object.freeze(new ModelicoMap(subtypes.keyMetadata, subtypes.valueMetadata, map));
      }

      return v;
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return { type: ModelicoMap, reviver: ModelicoMap.buildReviver(keyMetadata, valueMetadata) };
    }
  }]);

  return ModelicoMap;
}(Modelico);

module.exports = ModelicoMap;

},{"./Modelico":6}],6:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      return fields;
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
      var fieldValue = assignReducer({}, { field: field, value: value });
      var newFields = Object.assign({}, this.clone().fields(), fieldValue);
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

      return Modelico.reviver.bind(undefined, Type);
    }
  }, {
    key: 'reviver',
    value: function reviver(Type, k, v) {
      if (k === '') {
        return Object.freeze(new Type(v));
      }

      if (Type.metadata && Type.metadata[k]) {
        return Type.metadata[k].reviver('', v);
      }

      return v;
    }
  }]);

  return Modelico;
}();

module.exports = Modelico;

},{}],7:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modelico = require('./Modelico');

var ModelicoPrimitive = function (_Modelico) {
  _inherits(ModelicoPrimitive, _Modelico);

  function ModelicoPrimitive() {
    _classCallCheck(this, ModelicoPrimitive);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoPrimitive).apply(this, arguments));
  }

  _createClass(ModelicoPrimitive, null, [{
    key: 'reviver',
    value: function reviver(k, v) {
      return v;
    }
  }, {
    key: 'metadata',
    value: function metadata(primitiveType) {
      return { type: primitiveType, reviver: ModelicoPrimitive.reviver };
    }
  }]);

  return ModelicoPrimitive;
}(Modelico);

module.exports = ModelicoPrimitive;

},{"./Modelico":6}],8:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

var ModelicoEnum = require('./Enum');

var valuesReducer = function valuesReducer(acc, code) {
  return (acc[code] = { code: code }) && acc;
};

module.exports = function (values) {
  var valuesAsObject = Array.isArray(values) ? values.reduce(valuesReducer, {}) : values;

  var myEnum = new ModelicoEnum(valuesAsObject);
  myEnum.reviver = ModelicoEnum.reviver.bind(undefined, valuesAsObject);
  myEnum.metadata = function () {
    return { type: ModelicoEnum, reviver: myEnum.reviver };
  };

  return Object.freeze(myEnum);
};

},{"./Enum":3}]},{},[1])(1)
});