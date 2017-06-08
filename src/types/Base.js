import {
  always,
  defaultTo,
  isPlainObject,
  isSomething,
  emptyObject,
  haveDifferentTypes,
  equals
} from '../U'

import {typeSymbol, fieldsSymbol} from '../symbols'
import getInnerTypes from '../getInnerTypes'

const getPathReducer = (result, part) => result.get(part)

class Base {
  constructor(Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(
        `expected an object with fields for ${Type.displayName ||
          Type.name} but got ${fields}`
      )
    }

    // This slows down the benchmarks by a lot, but it isn't clear whether
    // real usage would benefit from removing it.
    // See: https://github.com/javiercejudo/modelico-benchmarks
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
      } else if (defaultCandidate !== undefined) {
        value = defaultCandidate
        defaults[key] = value
      } else {
        throw TypeError(`no value for key "${key}"`)
      }

      thisArg[key] = always(value)
    })

    thisArg[fieldsSymbol] = always(
      Object.freeze(Object.assign(defaults, fields))
    )
  }

  get [Symbol.toStringTag]() {
    return 'ModelicoModel'
  }

  get(field) {
    return this[fieldsSymbol]()[field]
  }

  getIn(path) {
    return path.reduce(getPathReducer, this)
  }

  copy(fields) {
    const newFields = Object.assign({}, this[fieldsSymbol](), fields)

    return new (this[typeSymbol]())(newFields)
  }

  set(field, value) {
    return this.copy({[field]: value})
  }

  setIn(path, value) {
    if (path.length === 0) {
      return this.copy(value)
    }

    const [key, ...restPath] = path
    const item = this[key]()

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
  }

  equals(other) {
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

  toJSON() {
    return this[fieldsSymbol]()
  }

  toJS() {
    return JSON.parse(JSON.stringify(this))
  }

  stringify(n) {
    return JSON.stringify(this, null, n)
  }

  static innerTypes() {
    return emptyObject
  }

  static factory(...args) {
    return new Base(...args)
  }
}

export default Object.freeze(Base)
