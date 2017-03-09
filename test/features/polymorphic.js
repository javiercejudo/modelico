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
    const { _, base, ajvMeta, ajvNumber, ajvString, ajvMaybe } = M.ajvMetadata(Ajv())

    const reviver = (k, v) => {
      if (k !== '') {
        return v
      }

      switch (v.type) {
        case 'circle':
          return new Circle(v)
        case 'diamond':
          return new Diamond(v)
        default:
          return new Shape(v)
      }
    }

    class Shape extends M.Base {
      constructor (Type, props) {
        super(Type, props)

        this.shapeType = () => props.type
      }

      toJSON () {
        const fields = M.fields(this)
        let type

        switch (this[M.symbols.typeSymbol]()) {
          case Circle:
            type = 'circle'
            break
          case Diamond:
            type = 'diamond'
            break
          default:
            type = undefined
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
          ].map(x => M.getSchema(_(x), false))
        }))
      }
    }

    class Circle extends Shape {
      constructor (props) {
        super(Circle, props)
      }

      area () {
        return Math.PI * this.radius() ** 2
      }

      static innerTypes () {
        return Object.freeze(Object.assign({}, super.innerTypes(), {
          radius: ajvNumber({minimum: 0, exclusiveMinimum: true})
        }))
      }

      static metadata () {
        return base(Circle)
      }
    }

    class Diamond extends Shape {
      constructor (props) {
        super(Diamond, props)
      }

      area () {
        return this.width() * this.height() / 2
      }

      static innerTypes () {
        return Object.freeze(Object.assign({}, super.innerTypes(), {
          width: ajvNumber({minimum: 0, exclusiveMinimum: true}),
          height: ajvNumber({minimum: 0, exclusiveMinimum: true})
        }))
      }

      static metadata () {
        return base(Diamond)
      }
    }

    class Person extends M.Base {
      constructor (props) {
        super(Person, props)
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvString({minLength: 1}),
          favouriteShape: _(Shape)
        })
      }
    }

    it('should revive polymorphic JSON', () => {
      const person1 = M.fromJS(Person, {
        name: 'Audrey',
        favouriteShape: {
          type: 'diamond',
          width: 8,
          height: 7
        }
      })

      const person2 = M.fromJS(Person, {
        name: 'Javier',
        favouriteShape: {
          type: 'circle',
          radius: 3
        }
      })

      const person3 = new Person({
        name: 'Leonardo',
        favouriteShape: new Diamond({
          width: 4,
          height: 12
        })
      })

      should(person1.favouriteShape().area())
        .be.exactly(28)

      should(person2.favouriteShape().area())
        .be.above(28)
        .and.exactly(Math.PI * 3 ** 2)

      person1.toJS().should.deepEqual({
        name: 'Audrey',
        favouriteShape: {
          type: 'diamond',
          relatedShape: null,
          width: 8,
          height: 7
        }
      })

      person2.toJS().should.deepEqual({
        name: 'Javier',
        favouriteShape: {
          type: 'circle',
          relatedShape: null,
          radius: 3
        }
      })

      person3.toJS().should.deepEqual({
        name: 'Leonardo',
        favouriteShape: {
          type: 'diamond',
          relatedShape: null,
          width: 4,
          height: 12
        }
      })
    })

    it('should provide its full schema', () => {
      const expectedSchema = {
        definitions: {
          1: {
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
            ]
          },
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
        },
        $ref: '#/definitions/1'
      }

      const actualSchema = M.getSchema(_(Person))

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
