(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(function() {
		var current = global.modelicoCustomFormatter;
		var exports = factory();
		global.modelicoCustomFormatter = exports;
		exports.noConflict = function() { global.modelicoCustomFormatter = current; return exports; };
	})();
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var customFormatter = (function (M) {
  var PREVIEW_MAX_LENGTH = 100;

  var isPlainObject = function isPlainObject(x) {
    return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && !!x;
  };
  var isModelico = function isModelico(obj) {
    return obj instanceof M.Base;
  };

  var styles = {
    keys: 'color: purple',
    normal: 'color: #444',
    childwrapper: 'margin-left: 15px; line-height: 1.5',
    childObject: 'margin-left: 26px;',
    childNative: 'margin-left: 14px;'
  };

  var formatKey = function formatKey(key) {
    return ['span', {}].concat([['span', { style: styles.keys }, '' + key], ['span', { style: styles.normal }, ': ']]);
  };

  var _header = function _header(obj) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        key = _ref.key,
        parentType = _ref.parentType;

    var objStr = obj.stringify();
    var snippet = objStr.slice(0, PREVIEW_MAX_LENGTH);

    var preview = objStr.length > PREVIEW_MAX_LENGTH ? snippet + '...' : snippet;

    var typeName = obj[M.symbols.typeSymbol]().name;

    var subtypeNames = void 0;

    try {
      subtypeNames = '<' + parentType.innerTypes()[key].subtypes.map(function (x) {
        return x.type.name;
      }).join(', ') + '> ';
    } catch (ignore) {
      subtypeNames = ' ';
    }

    var sizeStr = obj.hasOwnProperty('size') ? '(' + obj.size + ')' : '';

    return ['div', {}].concat([['span', {}, key ? formatKey(key) : ''], ['span', {}, typeName + sizeStr + subtypeNames], ['span', {}, preview]]);
  };

  var modelicoChild = function modelicoChild(obj, fields, key) {
    return ['object', {
      object: fields[key],
      config: {
        key: key,
        parentType: obj[M.symbols.typeSymbol]()
      }
    }];
  };

  var nativeChild = function nativeChild(obj, fields, key) {
    return ['div', { style: styles.childNative }].concat([formatKey(key), obj[M.symbols.typeSymbol]().innerTypes()[key].type.name + ' ', ['object', { object: fields[key] }]]);
  };

  var body = function body(obj) {
    var json = obj.toJSON();
    var fields = isPlainObject(json) ? json : {};
    var fieldsKeys = Object.keys(fields);

    var children = void 0;

    if (fieldsKeys.length === 0) {
      children = [['div', { style: styles.childObject }, ['object', { object: json }]]];
    } else {
      children = fieldsKeys.sort().reduce(function (acc, key) {
        var child = isModelico(fields[key]) ? modelicoChild(obj, fields, key) : nativeChild(obj, fields, key);

        acc.push(['div', { style: styles.childwrapper }, child]);

        return acc;
      }, []);
    }

    return ['div', {}].concat(children);
  };

  return Object.freeze({
    header: function header(obj, config) {
      return isModelico(obj) ? _header(obj, config) : null;
    },
    hasBody: function hasBody(obj) {
      return isModelico(obj);
    },
    body: body
  });
});

return customFormatter;

})));
