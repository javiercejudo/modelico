;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.modelicoCustomFormatter = factory())
})(this, function() {
  'use strict'

  var _typeof = typeof Symbol === 'function' &&
    typeof Symbol.iterator === 'symbol'
    ? function(obj) {
        return typeof obj
      }
    : function(obj) {
        return obj &&
          typeof Symbol === 'function' &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj
      }

  var customFormatter = function(M) {
    var PREVIEW_MAX_LENGTH = 100
    var FIELDS_POSTFIX = '()'

    var isPlainObject = function isPlainObject(x) {
      return (
        (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' &&
        !!x
      )
    }
    var isModelico = function isModelico(obj) {
      return obj instanceof M.Base
    }

    var styles = {
      keys: 'color: purple',
      normal: 'color: #444',
      childwrapper: 'margin-left: 15px; padding: 2px 0 1px',
      childObject: 'margin-left: 26px;',
      childNative: 'margin-left: 14px;'
    }

    var getTypeName = function getTypeName(type) {
      return type.displayName || type.name
    }

    var formatKey = function formatKey(key) {
      return ['span', {}].concat([
        ['span', {style: styles.keys}, '' + key],
        ['span', {style: styles.normal}, ': ']
      ])
    }

    var _header = function _header(obj) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : {},
        key = _ref.key,
        parentType = _ref.parentType

      var objStr = obj.stringify()
      var snippet = objStr.slice(0, PREVIEW_MAX_LENGTH)

      var preview = PREVIEW_MAX_LENGTH > 0 && objStr.length > PREVIEW_MAX_LENGTH
        ? snippet + '...'
        : snippet

      var typeName = getTypeName(obj[M.symbols.typeSymbol]())

      var subtypeNames = void 0

      try {
        subtypeNames =
          '<' +
          parentType
            .innerTypes()[key.slice(0, -FIELDS_POSTFIX.length)]
            .subtypes.map(function(x) {
              return getTypeName(x.type)
            })
            .join(', ') +
          '>'
      } catch (ignore) {
        subtypeNames = ''
      }

      var sizeStr = obj.hasOwnProperty('size') ? '(' + obj.size + ') ' : ' '

      return ['div', {}].concat([
        ['span', {}, key ? formatKey(key) : ''],
        ['span', {}, typeName + subtypeNames + sizeStr],
        ['span', {}, preview]
      ])
    }

    var modelicoChild = function modelicoChild(obj, fields, key) {
      return [
        'object',
        {
          object: fields[key],
          config: {
            key: key,
            parentType: obj[M.symbols.typeSymbol]()
          }
        }
      ]
    }

    var nativeChild = function nativeChild(fields, key) {
      return ['div', {style: styles.childNative}].concat([
        formatKey(key),
        ['object', {object: fields[key]}]
      ])
    }

    var withMethods = function withMethods(obj) {
      var fields = M.fields(obj)
      var json = Object.keys(fields).length === 0 ? obj.toJSON() : fields
      var base = isPlainObject(json) ? Object.assign({}, json) : {':': json}

      var res = Object.keys(base).reduce(function(acc, key) {
        var keyName = obj instanceof M.List
          ? 'get(' + key + ')'
          : key === ':' || Array.isArray(json) ? key : key + FIELDS_POSTFIX

        acc[keyName] = base[key]

        return acc
      }, {})

      return Object.keys(obj).reduce(function(acc, key) {
        if (!(key + FIELDS_POSTFIX in res)) {
          res[key] = obj[key]
        }

        return acc
      }, res)
    }

    var body = function body(obj) {
      var fields = withMethods(obj)
      var fieldsKeys = Object.keys(fields)

      var children = void 0

      if (fieldsKeys.length === 0) {
        children = [
          ['div', {style: styles.childObject}, ['object', {object: fields}]]
        ]
      } else {
        children = fieldsKeys.sort().reduce(function(acc, key) {
          var child = isModelico(fields[key])
            ? modelicoChild(obj, fields, key)
            : nativeChild(fields, key)

          acc.push(['div', {style: styles.childwrapper}, child])

          return acc
        }, [])
      }

      return ['div', {}].concat(children)
    }

    return Object.freeze({
      header: function header(obj, config) {
        return isModelico(obj) ? _header(obj, config) : null
      },
      hasBody: isModelico,
      body: body
    })
  }

  return customFormatter
})
