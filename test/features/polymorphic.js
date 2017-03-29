/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  describe('Enumerated: default type field', () => {
    const CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER'])
    const { _, number, stringMap, list, anyOf } = M.metadata()

    class NumberCollection extends M.Base {
      constructor (props) {
        super(props, NumberCollection)
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
        super(props, NumberCollection)
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
    const { _, base, ajvMeta, ajvNumber, ajvString, ajvMaybe } = M.ajvMetadata(Ajv())

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

    class Shape extends M.Base {
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

      static innerTypes () {
        return Object.freeze({
          relatedShape: ajvMaybe(_(Shape))
        })
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

    class Circle extends Shape {
      constructor (props) {
        super(props, Circle)
      }

      area () {
        return Math.PI * this.radius() ** 2
      }

      static innerTypes () {
        return Object.freeze(Object.assign({}, super.innerTypes(), {
          radius: ajvNumber({
            minimum: 0,
            exclusiveMinimum: true
          })
        }))
      }
    }

    class Diamond extends Shape {
      constructor (props) {
        super(props, Diamond)
      }

      area () {
        return this.width() * this.height() / 2
      }

      static innerTypes () {
        return Object.freeze(Object.assign({}, super.innerTypes(), {
          width: ajvNumber({
            minimum: 0,
            exclusiveMinimum: true
          }),
          height: ajvNumber({
            minimum: 0,
            exclusiveMinimum: true
          })
        }))
      }
    }

    class Geometer extends M.Base {
      constructor (props) {
        super(props, Geometer)
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvString({
            minLength: 1
          }),
          favouriteShape: _(Shape)
        })
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
            type: 'string',
            minLength: 1
          },
          favouriteShape: {
            anyOf: [
              {
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
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'radius'
                ]
              },
              {
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
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  },
                  height: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'width',
                  'height'
                ]
              }
            ]
          }
        },
        required: [
          'name',
          'favouriteShape'
        ],
        definitions: {
          3: {
            anyOf: [
              {
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
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'radius'
                ]
              },
              {
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
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  },
                  height: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'width',
                  'height'
                ]
              }
            ]
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
        super(props, NumberCollection)
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
