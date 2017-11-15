/* eslint-env mocha */
export default (U, should, M, fixtures, {Ajv}) => () => {
  const ajv = Ajv()

  const {
    _,
    base,
    asIs,
    any,
    string,
    number,
    wrappedNumber,
    boolean,
    date,
    _enum: enumType,
    enumMap,
    list,
    map,
    stringMap,
    set,
    maybe,
    anyOf,

    // normal
    withDefault
  } = M.ajvMetadata(ajv)

  describe('Animal example', () => {
    class Animal extends M.Base {
      constructor(props) {
        super(Animal, props)
      }

      static innerTypes() {
        return Object.freeze({
          name: withDefault(string({minLength: 1, maxLength: 25}), 'unknown'),
          dimensions: maybe(
            list(number({exclusiveMinimum: 0}), {minItems: 3, maxItems: 3})
          )
        })
      }
    }

    class Animal2 extends M.Base {
      constructor(props) {
        super(Animal2, props)
      }

      static innerTypes() {
        return Object.freeze({
          name: string({minLength: 1, maxLength: 25}),
          dimensions: maybe(list(number(), {minItems: 3, maxItems: 3}))
        })
      }
    }

    it('should revive as usual with valid JSON', () => {
      const bane1 = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      })

      bane1.name().should.be.exactly('Bane')

      bane1
        .dimensions()
        .getOrElse([1, 1, 1])
        .equals(M.List.of(20, 55, 65))
        .should.be.exactly(true)
    })

    it('should allow additional properties by default', () => {
      M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65],
        extra: 1
      }).should.not.throw()
    })

    it('should fail with invalid JSON', () => {
      should(() =>
        M.fromJS(Animal, {
          name: 'Bane',
          dimensions: [20, 55, 0]
        })
      )
        .throw(/Invalid JSON at "dimensions → 2"/)
        .and.throw(/should be > 0/)
    })

    it('should be able to return the whole schema', () => {
      const bane = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      })

      const animalNormalMeta = _(fixtures.Animal)
      const animalNormalMetaSchema = M.getSchema(animalNormalMeta)

      animalNormalMetaSchema.should.deepEqual({
        type: 'object',
        properties: {
          name: {}
        },
        required: ['name']
      })

      const animalMeta = _(Animal)
      const animal1Schema1 = M.getSchema(animalMeta)
      const animal1Schema2 = M.getSchema(animalMeta)

      animal1Schema1.should.deepEqual(animal1Schema2).and.deepEqual({
        type: 'object',
        properties: {
          name: {
            $ref: '#/definitions/2'
          },
          dimensions: {
            $ref: '#/definitions/4'
          }
        },
        definitions: {
          '2': {
            anyOf: [
              {type: 'null'},
              {
                $ref: '#/definitions/3'
              }
            ],
            default: 'unknown'
          },
          '3': {
            type: 'string',
            minLength: 1,
            maxLength: 25
          },
          '4': {
            anyOf: [
              {type: 'null'},
              {
                $ref: '#/definitions/5'
              }
            ]
          },
          '5': {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              $ref: '#/definitions/6'
            }
          },
          '6': {
            type: 'number',
            exclusiveMinimum: 0
          }
        }
      })

      const animalSchema2 = M.getSchema(_(Animal2, [], {}, true))

      animalSchema2.should.deepEqual({
        type: 'object',
        properties: {
          name: {
            $ref: '#/definitions/2'
          },
          dimensions: {
            $ref: '#/definitions/3'
          }
        },
        required: ['name'],
        definitions: {
          '2': {
            type: 'string',
            minLength: 1,
            maxLength: 25
          },
          '3': {
            anyOf: [
              {
                type: 'null'
              },
              {
                $ref: '#/definitions/4'
              }
            ]
          },
          '4': {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              type: 'number'
            }
          }
        }
      })

      const ajv = Ajv()

      ajv.validate(animal1Schema1, bane.toJS()).should.be.exactly(true)

      ajv
        .validate(animal1Schema1, bane.set('name', 'Robbie').toJS())
        .should.be.exactly(true)

      ajv
        .validate(animal1Schema1, bane.set('name', 2).toJS())
        .should.be.exactly(false)
    })
  })

  describe('deeply nested error examples', () => {
    it('list', () => {
      should(() =>
        M.ajvGenericsFromJSON(
          _,
          M.List,
          {},
          [list(list(number({minimum: 5})))],
          '[[[10], [6, 7, 4]]]'
        )
      )
        .throw(/Invalid JSON at "0 → 1 → 2"/)
        .and.throw(/should be >= 5/)
    })

    it('set', () => {
      should(() =>
        M.genericsFromJS(
          M.Set,
          [set(set(number({minimum: 5})))],
          [[[10], [6, 7, 9, 4]]]
        )
      )
        .throw(/Invalid JSON at "0 → 1 → 3"/)
        .and.throw(/should be >= 5/)
    })

    it('stringMap', () => {
      should(() =>
        M.genericsFromJS(
          M.StringMap,
          [stringMap(stringMap(number({minimum: 5})))],
          {a: {b1: {c: 10}, b2: {d1: 6, d2: 7, d3: 4}}}
        )
      )
        .throw(/Invalid JSON at "a → b2 → d3"/)
        .and.throw(/should be >= 5/)
    })

    it('map', () => {
      should(() =>
        M.genericsFromJS(
          M.Map,
          [string(), map(string(), number({minimum: 5}))],
          [['A', [['A', 6], ['B', 7], ['C', 4]]]]
        )
      )
        .throw(/Invalid JSON at "0 → 1 → 2 → 1"/)
        .and.throw(/should be >= 5/)

      should(() =>
        M.genericsFromJS(
          M.Map,
          [string(), map(string(), number({minimum: 5}))],
          [['A', [['A', 6], ['B', 7], [2, 7]]]]
        )
      )
        .throw(/Invalid JSON at "0 → 1 → 2 → 0"/)
        .and.throw(/should be string/)
    })

    it('enumMap', () => {
      const SideEnum = M.Enum.fromArray(['A', 'B'])

      should(() =>
        M.genericsFromJS(
          M.EnumMap,
          [
            _(SideEnum),
            enumMap(_(SideEnum), enumMap(_(SideEnum), number({minimum: 5})))
          ],
          {A: {A: {A: 10}, B: {A: 4, B: 7}}}
        )
      )
        .throw(/Invalid JSON at "A → B → A"/)
        .and.throw(/should be >= 5/)

      should(() =>
        M.genericsFromJS(
          M.EnumMap,
          [
            _(SideEnum),
            enumMap(_(SideEnum), enumMap(_(SideEnum), number({minimum: 5})))
          ],
          {A: {A: {A: 10}, B: {D: 5, B: 7}}}
        )
      )
        .throw(/Invalid JSON at "A → B"/)
        .and.throw(/should NOT have additional properties/)
    })
  })

  describe('togglability', () => {
    const {string: nonValidatedString} = M.ajvMetadata()

    it('defaults to normal behaviour when Ajv is undefined', () => {
      JSON.parse(
        '"aa"',
        nonValidatedString({minLength: 3}).reviver
      ).should.be.exactly('aa')

      should(() => JSON.parse('"aa"', string({minLength: 3}).reviver)).throw(
        /shorter than 3 characters/
      )
    })
  })

  describe('asIs', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', asIs().reviver).should.be.exactly('test')
    })

    it('supports valid values with schema', () => {
      JSON.parse(
        '"test"',
        asIs(x => x, {type: 'string'}).reviver
      ).should.be.exactly('test')
    })

    it('supports valid values with schema and transformer', () => {
      JSON.parse(
        '"test"',
        asIs(x => x.repeat(2), {type: 'string', maxLength: 5}, x => x.repeat(2))
          .reviver
      ).should.be.exactly('testtest')
    })

    it('rejects invalid values', () => {
      should(() =>
        JSON.parse('1', asIs(x => x, {type: 'string'}).reviver)
      ).throw(/should be string/)

      should(() =>
        JSON.parse(
          '"testtest"',
          asIs(x => x, {type: 'string', maxLength: 5}).reviver
        )
      ).throw(/should NOT be longer than 5 characters/)
    })
  })

  describe('any', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', any().reviver).should.be.exactly('test')

      should(JSON.parse('1', any().reviver)).be.exactly(1)
    })

    it('supports valid values with schema', () => {
      JSON.parse('"test"', any({type: 'string'}).reviver).should.be.exactly(
        'test'
      )
    })

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', any({type: 'string'}).reviver)).throw(
        /should be string/
      )
    })
  })

  describe('number', () => {
    it('reports the right type', () => {
      number().type.should.be.exactly(Number)
    })

    it('supports missing schema', () => {
      should(JSON.parse('1', number().reviver)).be.exactly(1)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', number({minimum: 3}).reviver)).be.exactly(4)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', number({minimum: 3}).reviver)).throw(
        /should be >= 3/
      )
    })
  })

  describe('number: wrapped json-compatible', () => {
    it('reports the right type', () => {
      wrappedNumber().type.should.be.exactly(M.Number)
    })

    it('supports missing schema', () => {
      should(JSON.parse('1', wrappedNumber().reviver).inner()).be.exactly(1)
    })

    it('supports valid numbers with schema', () => {
      should(
        JSON.parse('4', wrappedNumber({minimum: 3}).reviver).inner()
      ).be.exactly(4)
    })

    it('rejects invalid numbers', () => {
      should(() =>
        JSON.parse('2', wrappedNumber({minimum: 3}).reviver).inner()
      ).throw(/should be >= 3/)
    })
  })

  describe('number: wrapped non-json-compatible', () => {
    it('supports missing schema', () => {
      should(
        JSON.parse('"-Infinity"', wrappedNumber().reviver).inner()
      ).be.exactly(-Infinity)
    })

    it('supports valid numbers with schema', () => {
      should(
        JSON.parse('"Infinity"', wrappedNumber({minimum: 3}).reviver).inner()
      ).be.exactly(Infinity)
    })

    it('rejects invalid numbers', () => {
      should(() =>
        JSON.parse('"-Infinity"', wrappedNumber({minimum: 3}).reviver).inner()
      ).throw(/should be >= 3/)

      should(() =>
        JSON.parse('"1"', wrappedNumber({minimum: 3}).reviver).inner()
      ).throw(/should be number/)

      should(() =>
        JSON.parse('{"a": 1}', wrappedNumber({minimum: 3}).reviver).inner()
      ).throw(/should be number/)
    })
  })

  describe('string', () => {
    it('reports the right type', () => {
      string().type.should.be.exactly(String)
    })

    it('supports missing schema', () => {
      JSON.parse('"test"', string().reviver).should.be.exactly('test')
    })

    it('supports valid strings with schema', () => {
      JSON.parse('"test"', string({minLength: 3}).reviver).should.be.exactly(
        'test'
      )
    })

    it('rejects invalid strings', () => {
      should(() => JSON.parse('"aa"', string({minLength: 3}).reviver)).throw(
        /shorter than 3 characters/
      )
    })
  })

  describe('boolean', () => {
    it('reports the right type', () => {
      boolean().type.should.be.exactly(Boolean)
    })

    it('supports valid booleans', () => {
      JSON.parse('true', boolean().reviver).should.be.exactly(true)
    })

    it('rejects invalid booleans', () => {
      should(() => JSON.parse('1', boolean().reviver)).throw(
        /should be boolean/
      )
    })
  })

  describe('date', () => {
    it('reports the right type', () => {
      date().type.should.be.exactly(M.Date)
    })

    it('supports valid dates', () => {
      should(
        JSON.parse('"1988-04-16T00:00:00.000Z"', date().reviver)
          .inner()
          .getFullYear()
      ).be.exactly(1988)
    })

    it('rejects invalid dates', () => {
      should(() =>
        JSON.parse('"1988-04-16T00:00:00.000"', date().reviver)
      ).throw(/should match format "date-time"/)

      should(() => JSON.parse('"1988-04-16"', date().reviver)).throw(
        /should match format "date-time"/
      )
    })
  })

  describe('enum', () => {
    it('reports its full schema', () => {
      const Side = M.Enum.fromArray(['A', 'B'])

      M.getSchema(enumType(Side)).should.deepEqual({
        enum: ['A', 'B']
      })
    })
  })

  describe('enumMap', () => {
    class Side extends M.Enum {}

    const SideEnum = M.Enum.fromArray(['A', 'B'], Side, 'Side')

    it('reports its full schema', () => {
      const meta = enumMap(_(SideEnum), number())

      M.getSchema(meta).should.deepEqual({
        type: 'object',
        maxProperties: 2,
        additionalProperties: false,
        patternProperties: {
          '^(A|B)$': {
            type: 'number'
          }
        }
      })

      const meta2 = enumMap(_(SideEnum), number())

      M.getSchema(meta2).should.deepEqual({
        type: 'object',
        maxProperties: 2,
        additionalProperties: false,
        patternProperties: {
          '^(A|B)$': {
            type: 'number'
          }
        }
      })
    })

    it('reports the right types', () => {
      const meta = enumMap(_(SideEnum), number())

      meta.type.should.be.exactly(M.EnumMap)
      meta.subtypes[0].type.should.be.exactly(SideEnum)
      meta.subtypes[1].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      should(
        JSON.parse('{"B": 100}', enumMap(_(SideEnum), number()).reviver).get(
          SideEnum.B()
        )
      ).be.exactly(100)
    })

    it('supports valid enumMaps with schema', () => {
      should(
        JSON.parse(
          '{"B": 100}',
          enumMap(_(SideEnum), number(), {minProperties: 1}).reviver
        ).get(SideEnum.B())
      ).be.exactly(100)
    })

    it('rejects invalid enumMaps', () => {
      should(() =>
        JSON.parse(
          '{"A": 100}',
          enumMap(_(SideEnum), number(), {minProperties: 2}).reviver
        )
      ).throw(/should NOT have less than 2 properties/)

      should(() =>
        JSON.parse(
          '{"A": 100, "B": 200, "C": 300}',
          enumMap(_(SideEnum), number()).reviver
        )
      ).throw(/should NOT have more than 2 properties/)

      should(() =>
        JSON.parse(
          '{"A": 100, "B": 200, "C": 300}',
          enumMap(_(SideEnum), number(), {maxProperties: 3}).reviver
        )
      )
        .throw(/Invalid JSON at ""/)
        .and.throw(/should NOT have additional properties/)
    })
  })

  describe('list', () => {
    it('list', () => {
      M.getSchema(list(number({minimum: 5}), {minItems: 2})).should.deepEqual({
        type: 'array',
        minItems: 2,
        items: {
          $ref: '#/definitions/2'
        },
        definitions: {
          '2': {
            type: 'number',
            minimum: 5
          }
        }
      })
    })

    it('reports the right types', () => {
      list(string()).type.should.be.exactly(M.List)
      list(string()).subtypes[0].type.should.be.exactly(String)
    })

    it('supports empty schema', () => {
      JSON.parse('[2,5]', list(number()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true)
    })

    it('supports valid lists with schema', () => {
      JSON.parse('[2,5]', list(number(), {maxItems: 3}).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true)
    })

    it('rejects invalid lists', () => {
      should(() =>
        JSON.parse('[2,5,7,1]', list(number(), {maxItems: 3}).reviver)
      ).throw(/should NOT have more than 3 items/)
    })
  })

  describe('tuple', () => {
    it('valid data', () => {
      const metadata = list([string(), number()])

      JSON.parse('["a",5]', metadata.reviver)
        .equals(M.List.of('a', 5))
        .should.be.exactly(true)

      M.getSchema(metadata).should.deepEqual({
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [{type: 'string'}, {type: 'number'}]
      })
    })

    it('nested modelico object', () => {
      class Animal extends M.Base {
        constructor(props) {
          super(Animal, props)
        }

        static innerTypes() {
          return Object.freeze({
            name: withDefault(string({minLength: 1, maxLength: 25}), 'unknown'),
            dimensions: list(number({exclusiveMinimum: 0}), {
              minItems: 3,
              maxItems: 3
            })
          })
        }
      }

      const metadata = list([string(), _(Animal)])

      M.genericsFromJS(
        M.List,
        [[string(), _(Animal)]],
        [
          'a',
          {
            name: 'Bane',
            dimensions: [20, 55, 65]
          }
        ]
      )
        .equals(
          M.List.of(
            'a',
            new Animal({
              name: 'Bane',
              dimensions: M.List.of(20, 55, 65)
            })
          )
        )
        .should.be.exactly(true)

      M.getSchema(metadata).should.deepEqual({
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [
          {
            type: 'string'
          },
          {
            $ref: '#/definitions/3'
          }
        ],
        definitions: {
          '3': {
            type: 'object',
            properties: {
              name: {
                $ref: '#/definitions/4'
              },
              dimensions: {
                $ref: '#/definitions/6'
              }
            },
            required: ['dimensions']
          },
          '4': {
            anyOf: [
              {
                type: 'null'
              },
              {
                $ref: '#/definitions/5'
              }
            ],
            default: 'unknown'
          },
          '5': {
            type: 'string',
            minLength: 1,
            maxLength: 25
          },
          '6': {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              $ref: '#/definitions/7'
            }
          },
          '7': {
            type: 'number',
            exclusiveMinimum: 0
          }
        }
      })
    })

    it('invalid data', () => {
      const metadata = list([string(), number()])

      should(() => JSON.parse('["a",true]', metadata.reviver)).throw(
        /should be number/
      )

      should(() => JSON.parse('["a"]', metadata.reviver)).throw(
        /should NOT have less than 2 items/
      )

      should(() => JSON.parse('["a",1,2]', metadata.reviver)).throw(
        /should NOT have more than 2 items/
      )
    })

    it('maybe', () => {
      M.genericsFromJSON(M.List, [[string(), maybe(number())]], '["a",1]')
        .equals(M.List.of('a', M.Just.of(1)))
        .should.be.exactly(true)

      M.genericsFromJSON(M.List, [[string(), maybe(number())]], '["a",null]')
        .equals(M.List.of('a', M.Nothing))
        .should.be.exactly(true)
    })
  })

  describe('map', () => {
    it('reports its full schema', () => {
      const meta = map(number(), string())

      M.getSchema(meta).should.deepEqual({
        type: 'array',
        items: {
          type: 'array',
          maxItems: 2,
          minItems: 2,
          items: [{type: 'number'}, {type: 'string'}]
        }
      })
    })

    it('reports the right types', () => {
      const meta = map(number(), string())

      meta.type.should.be.exactly(M.Map)
      meta.subtypes[0].type.should.be.exactly(Number)
      meta.subtypes[1].type.should.be.exactly(String)
    })

    it('supports empty schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', map(number(), string()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true)
    })

    it('supports valid maps with schema', () => {
      JSON.parse(
        '[[2, "dos"],[5, "cinco"]]',
        map(number(), string(), {minItems: 2}).reviver
      )
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true)
    })

    it('rejects invalid maps', () => {
      should(() =>
        JSON.parse('[[2, "dos", "extra"]]', map(number(), string()).reviver)
      ).throw(/should NOT have more than 2 items/)

      should(() => JSON.parse('[[2]]', map(number(), string()).reviver)).throw(
        /should NOT have less than 2 items/
      )

      should(() =>
        JSON.parse(
          '[[1, "uno"], [2, "dos"], [3, "tres"]]',
          map(number(), string(), {minItems: 4}).reviver
        )
      ).throw(/should NOT have less than 4 items/)
    })
  })

  describe('stringMap', () => {
    it('reports its full schema', () => {
      const meta = stringMap(number())

      M.getSchema(meta).should.deepEqual({
        type: 'object',
        additionalProperties: false,
        patternProperties: {
          '.*': {
            type: 'number'
          }
        }
      })
    })

    it('reports the right types', () => {
      const meta = stringMap(number())

      meta.type.should.be.exactly(M.StringMap)
      meta.subtypes[0].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      should(
        JSON.parse('{"uno": 1}', stringMap(number()).reviver).get('uno')
      ).be.exactly(1)
    })

    it('supports valid stringMaps with schema', () => {
      should(
        JSON.parse(
          '{"uno": 1}',
          stringMap(number(), {minProperties: 1}).reviver
        ).get('uno')
      ).be.exactly(1)
    })

    it('rejects invalid stringMaps', () => {
      should(() =>
        JSON.parse(
          '{"uno": 1}',
          stringMap(number(), {minProperties: 2}).reviver
        )
      ).throw(/should NOT have less than 2 properties/)
    })
  })

  describe('set', () => {
    it('reports its full schema', () => {
      const meta = set(number())

      M.getSchema(meta).should.deepEqual({
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'number'
        }
      })
    })

    it('reports the right types', () => {
      set(number()).type.should.be.exactly(M.Set)
      set(number()).subtypes[0].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      JSON.parse('[2,5]', set(number()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })

    it('supports valid sets with schema', () => {
      JSON.parse('[2,5]', set(number(), {maxItems: 3}).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })

    it('rejects invalid sets', () => {
      should(() =>
        JSON.parse('[2,5,7,1]', set(number(), {maxItems: 3}).reviver)
      ).throw(/should NOT have more than 3 items/)
    })

    it('rejects duplicated values by default', () => {
      should(() => JSON.parse('[2,5,5]', set(number()).reviver)).throw(
        /should NOT have duplicate items/
      )
    })

    it('supports duplicates when explicitly told', () => {
      JSON.parse('[2,5,5]', set(number(), {uniqueItems: false}).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })
  })

  describe('maybe', () => {
    it('reports the right types', () => {
      maybe(string()).type.should.be.exactly(M.Maybe)
      maybe(string()).subtypes[0].type.should.be.exactly(String)
    })

    it('behaves just as the normal maybe metadata', () => {
      JSON.parse('null', maybe(string()).reviver)
        .getOrElse('fallback')
        .should.be.exactly('fallback')

      JSON.parse('"Javier"', maybe(string()).reviver)
        .getOrElse('fallback')
        .should.be.exactly('Javier')
    })

    it('honours its inner metadata constraints', () => {
      should(() => maybe(string({minLength: 1})).reviver('', 42)).throw(
        /should be string/
      )

      should(() => maybe(string({minLength: 1})).reviver('', '')).throw(
        /should NOT be shorter than 1 characters/
      )

      maybe(string({minLength: 0}))
        .reviver('', '')
        .equals(M.Just.of(''))
        .should.be.exactly(true)

      maybe(string({minLength: 0}))
        .reviver('', null)
        .isEmpty()
        .should.be.exactly(true)
    })

    it('honours its inner metadata constraints (2)', () => {
      should(() => maybe(wrappedNumber({minimum: 1})).reviver('', 0)).throw(
        /should be >= 1/
      )

      maybe(wrappedNumber({minimum: 0}))
        .reviver('', 0)
        .equals(M.Just.of(M.Number.of(0)))
        .should.be.exactly(true)

      maybe(wrappedNumber({minimum: 0}))
        .reviver('', null)
        .isEmpty()
        .should.be.exactly(true)
    })
  })

  describe('recipe: validate within the constructor', () => {
    const ajv = Ajv()

    it('should validate the default value', () => {
      class CountryCode extends M.Base {
        constructor(props) {
          if (!ajv.validate(M.getSchema(_(CountryCode)), props)) {
            throw TypeError(ajv.errors.map(error => error.message).join('\n'))
          }

          super(CountryCode, props)
        }

        static innerTypes() {
          return Object.freeze({
            value: withDefault(string({minLength: 3, maxLength: 3}), 'ESP')
          })
        }
      }

      ;(() => new CountryCode({value: 'SPAIN'})).should.throw(
        /should NOT be longer than 3 characters/
      )

      const australia = new CountryCode({value: 'AUS'})

      should(() => australia.set('value', 'AU')).throw(
        /should NOT be shorter than 3 characters/
      )
    })
  })

  describe('recipe: validation at top level', () => {
    class Animal extends M.Base {
      constructor(props) {
        super(Animal, props)
      }

      static innerTypes() {
        return Object.freeze({
          name: string()
        })
      }
    }

    const baseSchema = M.getSchema(_(Animal))

    const enhancedMeta = additionalProperties =>
      base(
        Animal,
        Object.assign({}, baseSchema, {
          additionalProperties
        }),
        true
      )

    it('supports additional properties unless otherwise stated', () => {
      should(() =>
        _(Animal).reviver('', {
          name: 'Bane',
          extra: 1
        })
      ).not.throw()

      should(() =>
        enhancedMeta(true).reviver('', {
          name: 'Bane',
          extra: 1
        })
      ).not.throw()

      M.getSchema(enhancedMeta(true)).should.deepEqual({
        type: 'object',
        additionalProperties: true,
        properties: {
          name: {
            type: 'string'
          }
        },
        required: ['name']
      })
    })

    it('supports failing with additional properties', () => {
      should(() =>
        enhancedMeta(false).reviver('', {
          name: 'Bane',
          extra: 1
        })
      ).throw(/should NOT have additional properties/)

      M.getSchema(enhancedMeta(false)).should.deepEqual({
        type: 'object',
        additionalProperties: false,
        properties: {
          name: {
            type: 'string'
          }
        },
        required: ['name']
      })
    })

    it('should allow basic validation at top level', () => {
      should(() =>
        M.ajvFromJSON(
          _,
          Animal,
          {maxProperties: 2},
          `{
        "name": "Bane",
        "dimensions": [20, 55, 65],
        "extra": 1
      }`
        )
      ).throw(/should NOT have more than 2 properties/)
    })
  })

  describe('withValidation', () => {
    it('facilitates custom validation rules', () => {
      const lowerCaseString = schema =>
        M.withValidation(
          v => v.toLowerCase() === v,
          (v, path) =>
            `string ${v} at "${path.join(' → ')}" is not all lower case`
        )(string(schema))

      JSON.parse(
        '"abc123"',
        lowerCaseString({minLength: 5}).reviver
      ).should.be.exactly('abc123')

      should(() =>
        JSON.parse('"abc"', lowerCaseString({minLength: 5}).reviver)
      ).throw(/should NOT be shorter than 5 characters/)

      should(() =>
        JSON.parse('"aBc123"', lowerCaseString({minLength: 5}).reviver)
      ).throw(/string aBc123 at "" is not all lower case/)
    })

    it('should compose well', () => {
      const noNumbers = M.withValidation(
        v => /^[^0-9]*$/.test(v),
        (v, path) =>
          `string ${v} at "${path.join(' > ')}" should NOT contain numbers`
      )

      const lowercase = M.withValidation(
        v => v.toLowerCase() === v,
        (v, path) =>
          `string ${v} at "${path.join(
            ' > '
          )}" should NOT have uppercase characters`
      )

      const specialString = U.pipe(string, noNumbers, lowercase)
      const specialReviver = x => specialString({minLength: 1}).reviver('', x)

      should(() => specialReviver('')).throw(
        /should NOT be shorter than 1 characters/
      )

      should(() => specialReviver('a1')).throw(/should NOT contain numbers/)

      should(() => specialReviver('abcAd')).throw(
        /should NOT have uppercase characters/
      )

      specialReviver('abc').should.be.exactly('abc')
    })

    it('should have a default error message', () => {
      const lowerCaseString = schema =>
        M.withValidation(v => v.toLowerCase() === v)(string(schema))

      should(() =>
        JSON.parse('"aBc123"', lowerCaseString({minLength: 5}).reviver)
      ).throw(/Invalid value at ""/)
    })

    it('should work for nested metadata', () => {
      const lowerCaseString = schema =>
        M.withValidation(
          v => v.toLowerCase() === v,
          (v, path) =>
            `string ${v} at "${path.join(' → ')}" is not all lower case`
        )(string(schema))

      class MagicString extends M.Base {
        constructor(props) {
          super(MagicString, props)
        }

        static innerTypes() {
          return Object.freeze({
            str: lowerCaseString({minLength: 5})
          })
        }
      }

      M.fromJSON(MagicString, '{"str": "abc123"}')
        .str()
        .should.be.exactly('abc123')

      should(() => M.fromJSON(MagicString, '{"str": "abc"}')).throw(
        /should NOT be shorter than 5 characters/
      )

      should(() => M.fromJSON(MagicString, '{"str": "aBc123"}')).throw(
        /string aBc123 at "str" is not all lower case/
      )

      should(() =>
        JSON.parse(
          '{"str": "abc123", "forceFail": true}',
          M.withValidation(
            v => M.fields(v).forceFail !== true,
            () => 'forcibly failed'
          )(_(MagicString)).reviver
        )
      ).throw(/forcibly failed/)
    })
  })

  describe('anyOf', () => {
    class ScoreType extends M.Enum {}
    const ScoreTypeEnum = M.Enum.fromArray(
      ['Numeric', 'Alphabetic'],
      ScoreType,
      'ScoreType'
    )

    class Score extends M.Base {
      constructor(props) {
        super(Score, props)
      }

      static innerTypes() {
        return Object.freeze({
          type: enumType(ScoreTypeEnum),
          score: anyOf([
            [number({minimum: 0}), ScoreTypeEnum.Numeric()],
            [string({minLength: 1}), ScoreTypeEnum.Alphabetic()]
          ])
        })
      }
    }

    it('reports its full schema', () => {
      const expectedSchema = {
        type: 'object',
        properties: {
          type: {
            $ref: '#/definitions/4'
          },
          score: {
            $ref: '#/definitions/5'
          }
        },
        required: ['type', 'score'],
        definitions: {
          '2': {
            type: 'number',
            minimum: 0
          },
          '3': {
            type: 'string',
            minLength: 1
          },
          '4': {
            enum: ['Numeric', 'Alphabetic']
          },
          '5': {
            anyOf: [
              {
                $ref: '#/definitions/2'
              },
              {
                $ref: '#/definitions/3'
              }
            ]
          }
        }
      }

      M.getSchema(_(Score)).should.deepEqual(expectedSchema)
    })
  })

  describe('Circular innerTypes', () => {
    it('self reference', () => {
      const ChainBase = M.createAjvModel(Ajv(), m => {
        const maybeChain = m.maybe(m._(Chain))

        return {
          description: m.string({minLength: 1}),
          previous: maybeChain,
          next: maybeChain,
          relatedChains: m.list(m._(Chain))
        }
      })

      class Chain extends ChainBase {
        constructor(props) {
          super(Chain, props)
        }
      }

      M.getSchema(_(Chain)).should.deepEqual({
        definitions: {
          '1': {
            type: 'object',
            properties: {
              description: {
                $ref: '#/definitions/2'
              },
              previous: {
                $ref: '#/definitions/3'
              },
              next: {
                $ref: '#/definitions/3'
              },
              relatedChains: {
                $ref: '#/definitions/4'
              }
            },
            required: ['description', 'relatedChains']
          },
          '2': {
            type: 'string',
            minLength: 1
          },
          '3': {
            anyOf: [
              {
                type: 'null'
              },
              {
                $ref: '#/definitions/1'
              }
            ]
          },
          '4': {
            type: 'array',
            items: {
              $ref: '#/definitions/1'
            }
          }
        },
        $ref: '#/definitions/1'
      })
    })

    it('indirect reference', () => {
      const nonEmptyString = string({minLength: 1})

      let maybeChildMetadata
      const maybeChild = () => {
        if (!maybeChildMetadata) {
          maybeChildMetadata = maybe(_(Child))
        }

        return maybeChildMetadata
      }

      class Parent extends M.Base {
        constructor(props) {
          super(Parent, props)
        }

        static innerTypes() {
          return Object.freeze({
            name: nonEmptyString,
            child: maybeChild()
          })
        }
      }

      class Child extends M.Base {
        constructor(props) {
          super(Child, props)
        }

        static innerTypes() {
          return Object.freeze({
            name: nonEmptyString,
            parent: _(Parent)
          })
        }
      }

      class Person extends M.Base {
        constructor(props) {
          super(Person, props)
        }

        static innerTypes() {
          return Object.freeze({
            name: nonEmptyString,
            parent: _(Parent),
            child: maybeChild()
          })
        }
      }

      M.getSchema(_(Person)).should.deepEqual({
        type: 'object',
        properties: {
          name: {
            $ref: '#/definitions/2'
          },
          parent: {
            $ref: '#/definitions/3'
          },
          child: {
            $ref: '#/definitions/4'
          }
        },
        required: ['name', 'parent'],
        definitions: {
          '2': {
            type: 'string',
            minLength: 1
          },
          '3': {
            type: 'object',
            properties: {
              name: {
                $ref: '#/definitions/2'
              },
              child: {
                $ref: '#/definitions/4'
              }
            },
            required: ['name']
          },
          '4': {
            anyOf: [
              {
                type: 'null'
              },
              {
                $ref: '#/definitions/5'
              }
            ]
          },
          '5': {
            type: 'object',
            properties: {
              name: {
                $ref: '#/definitions/2'
              },
              parent: {
                $ref: '#/definitions/3'
              }
            },
            required: ['name', 'parent']
          }
        }
      })
    })
  })

  describe('formatAjvError', () => {
    it('does not require a path', () => {
      const meta = string({minLength: 1})

      should(() => JSON.parse('""', string({minLength: 1}).reviver)).throw()

      M.util
        .formatAjvError(ajv, M.getSchema(meta), '')
        .should.match(/Invalid JSON at ""/)
    })
  })
}
