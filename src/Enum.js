import { always, isNothing, emptyObject } from './U'
import Base from './Base'

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } })

const reviverFactory = enumerators => (k, v) => {
  const enumerator = enumerators[v]

  if (isNothing(enumerator)) {
    throw TypeError(`missing enumerator (${v})`)
  }

  return enumerator
}

class Enum extends Base {
  constructor (input, Ctor = Enum, displayName = Ctor.displayName) {
    const enumerators = Array.isArray(input)
      ? input.reduce(enumeratorsReducer, {})
      : input

    if (Ctor !== Enum) {
      Ctor.displayName = displayName
      Object.freeze(Ctor)
    }

    super(Ctor)

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => {
        this[enumerator] = always(enumerators[enumerator])
        enumerators[enumerator].toJSON = always(enumerator)
        enumerators[enumerator].equals = other => (enumerators[enumerator] === other)
      })

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: Ctor,
        reviver: reviverFactory(enumerators)
      }))
    })
  }

  static fromObject (...args) {
    return new Enum(...args)
  }

  static fromArray (...args) {
    return new Enum(...args)
  }

  static innerTypes () {
    return emptyObject
  }
}

Object.defineProperty(Enum, 'displayName', {
  value: 'Enum',
  writable: true
})

export default Enum
