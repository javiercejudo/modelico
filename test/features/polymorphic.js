/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
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

  describe('Based on runtime type field', () => {
    const ajv = Ajv()
    const { _, base, ajvMeta } = M.ajvMetadata(ajv)

    const ShapeType = M.Enum.fromArray(['CIRCLE', 'DIAMOND'])

    const reviver = (k, v) => {
      if (k !== '') {
        return v
      }

      switch (v.type) {
        case ShapeType.CIRCLE().toJSON():
          return new Circle(v)
        case ShapeType.DIAMOND().toJSON():
          return new Diamond(v)
        default:
          throw TypeError('Unsupported or missing shape type in the Shape reviver.')
      }
    }

    class Shape extends M.createAjvModel(ajv, m => ({
      relatedShape: m.ajvMaybe(m._(Shape))
    })) {
      toJSON () {
        const fields = M.fields(this)
        let type

        switch (this[M.symbols.typeSymbol]()) {
          case Circle:
            type = ShapeType.CIRCLE()
            break
          case Diamond:
            type = ShapeType.DIAMOND()
            break
          default:
            throw TypeError('Unsupported Shape in the toJSON method.')
        }

        return Object.freeze(Object.assign({type}, fields))
      }

      static metadata () {
        const baseMetadata = Object.assign({}, base(Shape), {reviver})

        return ajvMeta(baseMetadata, {}, {}, () => ({
          anyOf: [
            Circle,
            Diamond
          ].map(x => M.getSchema(base(x), false))
        }))
      }
    }

    class Circle extends M.createAjvModel(ajv, m => Object.assign({}, Shape.innerTypes(), {
      radius: m.ajvNumber({
        minimum: 0,
        exclusiveMinimum: true
      })
    }), {base: Shape}) {
      constructor (props) {
        super(Circle, props)
      }

      area () {
        return Math.PI * this.radius() ** 2
      }
    }

    class Diamond extends M.createAjvModel(ajv, m => Object.assign({}, Shape.innerTypes(), {
      width: m.ajvNumber({
        minimum: 0,
        exclusiveMinimum: true
      }),
      height: m.ajvNumber({
        minimum: 0,
        exclusiveMinimum: true
      })
    }), {base: Shape}) {
      constructor (props) {
        super(Diamond, props)
      }

      area () {
        return this.width() * this.height() / 2
      }
    }

    class Geometer extends M.createAjvModel(ajv, m => ({
      name: m.ajvString({
        minLength: 1
      }),
      favouriteShape: m._(Shape)
    })) {
      constructor (props) {
        super(Geometer, props)
      }
    }

    it('should revive polymorphic JSON', () => {
      const geometer1 = M.fromJS(Geometer, {
        name: 'Audrey',
        favouriteShape: {
          type: 'DIAMOND',
          width: 8,
          height: 7
        }
      })

      const geometer2 = M.fromJS(Geometer, {
        name: 'Javier',
        favouriteShape: {
          type: 'CIRCLE',
          radius: 3
        }
      })

      const geometer3 = new Geometer({
        name: 'Leonardo',
        favouriteShape: new Diamond({
          width: 4,
          height: 12
        })
      })

      should(geometer1.favouriteShape().area())
        .be.exactly(28)

      should(geometer2.favouriteShape().area())
        .be.above(28)
        .and.exactly(Math.PI * 3 ** 2)

      geometer1.toJS().should.deepEqual({
        name: 'Audrey',
        favouriteShape: {
          type: 'DIAMOND',
          relatedShape: null,
          width: 8,
          height: 7
        }
      })

      geometer2.toJS().should.deepEqual({
        name: 'Javier',
        favouriteShape: {
          type: 'CIRCLE',
          relatedShape: null,
          radius: 3
        }
      })

      geometer3.toJS().should.deepEqual({
        name: 'Leonardo',
        favouriteShape: {
          type: 'DIAMOND',
          relatedShape: null,
          width: 4,
          height: 12
        }
      })
    })

    it('should provide its full schema', () => {
      const expectedSchema = {
        type: 'object',
        properties: {
          name: {
            $ref: '#/definitions/2'
          },
          favouriteShape: {
            $ref: '#/definitions/3'
          }
        },
        required: ['name', 'favouriteShape'],
        definitions: {
          '2': {
            type: 'string',
            minLength: 1
          },
          '3': {
            anyOf: [
              {
                $ref: '#/definitions/4'
              },
              {
                $ref: '#/definitions/7'
              }
            ]
          },
          '4': {
            type: 'object',
            properties: {
              relatedShape: {
                anyOf: [
                  {
                    type: 'null'
                  },
                  {
                    $ref: '#/definitions/3'
                  }
                ]
              },
              radius: {
                $ref: '#/definitions/6'
              }
            },
            required: ['radius']
          },
          '6': {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: true
          },
          '7': {
            type: 'object',
            properties: {
              relatedShape: {
                anyOf: [
                  {
                    type: 'null'
                  },
                  {
                    $ref: '#/definitions/3'
                  }
                ]
              },
              width: {
                $ref: '#/definitions/9'
              },
              height: {
                $ref: '#/definitions/10'
              }
            },
            required: ['width', 'height']
          },
          '9': {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: true
          },
          '10': {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: true
          }
        }
      }

      const actualSchema = M.getSchema(_(Geometer))

      actualSchema.should.deepEqual(expectedSchema)
    })
  })

  describe('Based on value only', () => {
    const { number, stringMap, list } = M.metadata()

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props)
      }

      getNumbers () {
        const collection = this.collection()

        return (collection[M.symbols.typeSymbol]() === M.List)
          ? [...collection]
          : [...collection[M.symbols.innerOrigSymbol]().values()]
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          collection: v => Array.isArray(v.collection)
            ? list(number())
            : stringMap(number())
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        collection: {a: 10, b: 25, c: 4000}
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
