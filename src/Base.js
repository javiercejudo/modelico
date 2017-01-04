import {
  always, defaultTo, isPlainObject, isSomething, getInnerTypes,
  emptyObject, haveDifferentTypes, equals
} from './U'

import { typeSymbol, fieldsSymbol } from './symbols'

import M from './'

class Base {
  constructor (Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.displayName || Type.name} but got ${fields}`)
    }

    Object.freeze(fields)

    const innerTypes = getInnerTypes(0, Type)

    thisArg = defaultTo(this)(thisArg)
    thisArg[typeSymbol] = always(Type)
    thisArg[fieldsSymbol] = always(fields)

    Object.keys(innerTypes).forEach(key => {
      const valueCandidate = fields[key]
      let value = M.Maybe.EMPTY

      if (isSomething(valueCandidate)) {
        value = valueCandidate
      } else if (innerTypes[key].type !== M.Maybe) {
        throw TypeError(`no value for key "${key}"`)
      }

      thisArg[key] = always(value)
    })
  }

  set (field, value) {
    const newFields = Object.assign({}, this[fieldsSymbol](), {[field]: value})

    return new (this[typeSymbol]())(newFields)
  }

  setPath (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path
    const item = this[key]()

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
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
