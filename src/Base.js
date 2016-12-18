import {
  always, defaultTo, isPlainObject, isSomething, getInnerTypes,
  emptyObject
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

    const item = this[path[0]]()

    if (!item.setPath) {
      return this.set(path[0], value)
    }

    return this.set(path[0], item.setPath(path.slice(1), value))
  }

  equals (other) {
    return (JSON.stringify(this) === JSON.stringify(other))
  }

  toJSON () {
    return this[fieldsSymbol]()
  }

  static factory (...args) {
    return new Base(...args)
  }
}

export default Object.freeze(Base)
