/* eslint-env mocha */

export default (should, M) => () => {
  describe('Enumerated: default type field', () => {
    const CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER'])
    const { _, number, stringMap, list, anyOf } = M.metadata()

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props)
      }

      getNumbers () {
        const { type, collection } = this

        switch (type()) {
          case CollectionType.OBJECT():
            return [...collection()[M.symbols.innerOrigSymbol]().values()]
          case CollectionType.ARRAY():
            return [...collection()]
          default:
            throw TypeError(`Unsupported NumberCollection with type ${type().toJSON()}`)
        }
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          type: _(CollectionType),
          collection: anyOf([
            [stringMap(number()), CollectionType.OBJECT()],
            [list(number()), CollectionType.ARRAY()]
          ])
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        type: 'OBJECT',
        collection: {'a': 10, 'b': 25, 'c': 4000}
      })

      should(col1.sum())
        .be.exactly(4035)
    })

    it('should revive polymorphic JSON (2)', () => {
      const col2 = M.fromJS(NumberCollection, {
        type: 'ARRAY',
        collection: [1, 2, 3, 4, 3]
      })

      should(col2.sum())
        .be.exactly(13)
    })

    it('should revive polymorphic JSON (3)', () => {
      should(() => M.fromJS(NumberCollection, {
        type: 'OTHER',
        collection: '1,2,3,4,5'
      })).throw(/unsupported enumerator "OTHER" at ""/)
    })
  })

  describe('Enumerated: custom field', () => {
    const CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER'])
    const { _, number, stringMap, list, anyOf } = M.metadata()

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props)
      }

      getNumbers () {
        const { collectionType, collection } = this

        switch (collectionType()) {
          case CollectionType.OBJECT():
            return [...collection()[M.symbols.innerOrigSymbol]().values()]
          case CollectionType.ARRAY():
            return [...collection()]
          default:
            throw TypeError(`Unsupported NumberCollection with type ${collectionType().toJSON()}`)
        }
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          collectionType: _(CollectionType),
          collection: anyOf([
            [stringMap(number()), CollectionType.OBJECT()],
            [list(number()), CollectionType.ARRAY()]
          ], 'collectionType')
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        collectionType: 'OBJECT',
        collection: {'a': 10, 'b': 25, 'c': 4000}
      })

      should(col1.sum())
        .be.exactly(4035)
    })

    it('should revive polymorphic JSON (2)', () => {
      const col2 = M.fromJS(NumberCollection, {
        collectionType: 'ARRAY',
        collection: [1, 2, 3, 4, 3]
      })

      should(col2.sum())
        .be.exactly(13)
    })

    it('should revive polymorphic JSON (3)', () => {
      should(() => M.fromJS(NumberCollection, {
        collectionType: 'OTHER',
        collection: '1,2,3,4,5'
      })).throw(/unsupported enumerator "OTHER" at ""/)
    })
  })

  describe('Base on value only', () => {
    const { number, stringMap, list } = M.metadata()

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props)
      }

      getNumbers () {
        const collection = this.collection()

        return Array.isArray(collection)
          ? [...collection]
          : [...collection[M.symbols.innerOrigSymbol]().values()]
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          collection: v => Array.isArray(v)
            ? list(number())
            : stringMap(number())
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        collection: {'a': 10, 'b': 25, 'c': 4000}
      })

      should(col1.sum())
        .be.exactly(4035)
    })

    it('should revive polymorphic JSON (2)', () => {
      const col2 = M.fromJS(NumberCollection, {
        collection: [1, 2, 3, 4, 3]
      })

      should(col2.sum())
        .be.exactly(13)
    })
  })
}
