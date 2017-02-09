import {
  always, defaultTo, isPlainObject, isSomething,
  emptyObject, haveDifferentTypes, equals
} from './U'

import { typeSymbol, fieldsSymbol } from './symbols'
import getInnerTypes from './getInnerTypes'

const getPathReducer = (result, part) => result.get(part)

class Base {
  constructor (Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.displayName || Type.name} but got ${fields}`)
    }

    Object.freeze(fields)

    const defaults = {}
    const innerTypes = getInnerTypes([], Type)

    thisArg = defaultTo(this)(thisArg)
    thisArg[typeSymbol] = always(Type)

    Object.keys(innerTypes).forEach(key => {
      const valueCandidate = fields[key]
      const defaultCandidate = innerTypes[key].default
      let value

      if (isSomething(valueCandidate)) {
        value = valueCandidate
      } else if (isSomething(defaultCandidate)) {
        value = innerTypes[key].default
        defaults[key] = value
      } else {
        throw TypeError(`no value for key "${key}"`)
      }

      thisArg[key] = always(value)
    })

    thisArg[fieldsSymbol] = always(Object.freeze(Object.assign(defaults, fields)))
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoModel'
  }

  get (field) {
    return this[fieldsSymbol]()[field]
  }

  getIn (path) {
    return path.reduce(getPathReducer, this)
  }

  set (field, value) {
    const newFields = Object.assign({}, this[fieldsSymbol](), {[field]: value})

    return new (this[typeSymbol]())(newFields)
  }

  setIn (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path
    const item = this[key]()

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const thisFields = this[fieldsSymbol]()
    const otherFields = other[fieldsSymbol]()

    const thisKeys = Object.keys(thisFields)
    const otherKeys = Object.keys(otherFields)

    if (thisKeys.length !== otherKeys.length) {
      return false
    }

    return thisKeys.every(key => equals(thisFields[key], otherFields[key]))
  }

  toJSON () {
    return this[fieldsSymbol]()
  }

  toJS () {
    return JSON.parse(JSON.stringify(this))
  }

  stringify (n) {
    return JSON.stringify(this, null, n)
  }

  static factory (...args) {
    return new Base(...args)
  }
}

export default Object.freeze(Base)
