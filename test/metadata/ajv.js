/* eslint-env mocha */

export default (should, M, fixtures, { Ajv }) => () => {
  const {
    ajv_,
    ajvBase,
    ajvAsIs,
    ajvAny,
    ajvString,
    ajvNumber,
    ajvBoolean,
    ajvDate,
    ajvEnum,
    ajvEnumMap,
    ajvList,
    ajvMap,
    ajvStringMap,
    ajvSet,
    ajvMaybe,
    ajvWithDefault,
    // normal
    _,
    base,
    number
  } = M.ajvMetadata(Ajv())

  describe('Animal example', () => {
    class Animal extends M.Base {
      constructor (props) {
        super(Animal, props)
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvWithDefault(ajvString({ minLength: 1, maxLength: 25 }), 'unknown'),
          dimensions:
            ajvMaybe(
              ajvList({ minItems: 3, maxItems: 3 },
                ajvNumber({ minimum: 0, exclusiveMinimum: true })))
        })
      }
    }

    class Animal2 extends M.Base {
      constructor (props) {
        super(Animal, props)
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvString({ minLength: 1, maxLength: 25 }),
          dimensions:
            ajvMaybe(
              ajvList({ minItems: 3, maxItems: 3 },
                number()))
        })
      }
    }

    it('should revive as usual with valid JSON', () => {
      const bane1 = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      })

      bane1.name().should.be.exactly('Bane')

      bane1.dimensions().getOrElse([1, 1, 1]).equals(M.List.of(20, 55, 65))
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
      should(() => M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 0]
      }))
        .throw(/Invalid JSON at "dimensions > 2"/)
        .and.throw(/should be > 0/)
    })

    it('should be able to return the whole schema', () => {
      const bane = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      })

      const animalNormalMeta = _(fixtures.Animal)
      const animalNormalMetaSchema = M.getSchema(animalNormalMeta)

      animalNormalMetaSchema
        .should.deepEqual({
          type: 'object',
          properties: {
            name: {}
          },
          required: ['name']
        })

      const animalMeta = ajv_(Animal)
      const animal1Schema1 = M.getSchema(animalMeta, 'http://json-schema.org/draft-04/schema#')
      const animal1Schema2 = M.getSchema(animalMeta, 'http://json-schema.org/draft-04/schema#')

      animal1Schema1
        .should.deepEqual(animal1Schema2)
        .and.deepEqual({
          '$schema': 'http://json-schema.org/draft-04/schema#',
          type: 'object',
          properties: {
            name: {
              default: 'unknown',
              type: 'string',
              minLength: 1,
              maxLength: 25
            },
            dimensions: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'number',
                exclusiveMinimum: true,
                minimum: 0
              }
            }
          }
        })

      const animalSchema2 = M.getSchema(ajv_(Animal2))

      animalSchema2.should.deepEqual({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 25
          },
          dimensions: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {}
          }
        },
        required: ['name']
      })

      const ajv = Ajv()

      ajv.validate(animal1Schema1, bane.toJS())
        .should.be.exactly(true)

      ajv.validate(animal1Schema1, bane.set('name', 'Robbie').toJS())
        .should.be.exactly(true)

      ajv.validate(animal1Schema1, bane.set('name', 2).toJS())
        .should.be.exactly(false)
    })
  })

  describe('deeply nested error examples', () => {
    it('list', () => {
      should(() => M.ajvGenericsFromJSON(ajv_, M.List, {}, [
        ajvList({}, ajvList({}, ajvNumber({minimum: 5})))
      ], '[[[10], [6, 7, 4]]]'))
        .throw(/Invalid JSON at "0 > 1 > 2"/)
        .and.throw(/should be >= 5/)
    })

    it('set', () => {
      should(() => M.genericsFromJS(M.Set, [
        ajvSet({}, ajvSet({}, ajvNumber({minimum: 5})))
      ], [[[10], [6, 7, 9, 4]]]))
        .throw(/Invalid JSON at "0 > 1 > 3"/)
        .and.throw(/should be >= 5/)
    })

    it('stringMap', () => {
      should(() => M.genericsFromJS(M.StringMap, [
        ajvStringMap({}, ajvStringMap({}, ajvNumber({minimum: 5})))
      ], {a: {b1: {c: 10}, b2: {d1: 6, d2: 7, d3: 4}}}))
        .throw(/Invalid JSON at "a > b2 > d3"/)
        .and.throw(/should be >= 5/)
    })

    it('map', () => {
      should(() => M.genericsFromJS(M.Map, [
        ajvString(),
        ajvMap({}, ajvString(), ajvNumber({minimum: 5}))
      ], [['A', [['A', 6], ['B', 7], ['C', 4]]]]))
        .throw(/Invalid JSON at "0 > 1 > 2 > 1"/)
        .and.throw(/should be >= 5/)

      should(() => M.genericsFromJS(M.Map, [
        ajvString(),
        ajvMap({}, ajvString(), ajvNumber({minimum: 5}))
      ], [['A', [['A', 6], ['B', 7], [2, 7]]]]))
        .throw(/Invalid JSON at "0 > 1 > 2 > 0"/)
        .and.throw(/should be string/)
    })

    it('enumMap', () => {
      const SideEnum = M.Enum.fromArray(['A', 'B'])

      should(() => M.genericsFromJS(M.EnumMap, [
        ajv_(SideEnum),
        ajvEnumMap({}, ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvNumber({minimum: 5})))
      ], {A: {A: {A: 10}, B: {A: 4, B: 7}}}))
        .throw(/Invalid JSON at "A > B > A"/)
        .and.throw(/should be >= 5/)

      should(() => M.genericsFromJS(M.EnumMap, [
        ajv_(SideEnum),
        ajvEnumMap({}, ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvNumber({minimum: 5})))
      ], {A: {A: {A: 10}, B: {D: 5, B: 7}}}))
        .throw(/Invalid JSON at "A > B"/)
        .and.throw(/should NOT have additional properties/)
    })
  })

  describe('togglability', () => {
    const { ajvString: nonValidatedString } = M.ajvMetadata()

    it('defaults to normal behaviour when Ajv is undefined', () => {
      JSON.parse('"aa"', nonValidatedString({ minLength: 3 }).reviver)
        .should.be.exactly('aa')

      should(() => JSON.parse('"aa"', ajvString({ minLength: 3 }).reviver))
        .throw(/shorter than 3 characters/)
    })
  })

  describe('asIs', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', ajvAsIs().reviver)
        .should.be.exactly('test')
    })

    it('supports valid values with schema', () => {
      JSON.parse('"test"', ajvAsIs({ type: 'string' }).reviver)
        .should.be.exactly('test')
    })

    it('supports valid values with schema and transformer', () => {
      JSON.parse('"test"', ajvAsIs({ type: 'string', maxLength: 5 }, x => x.repeat(2)).reviver)
        .should.be.exactly('testtest')
    })

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', ajvAsIs({ type: 'string' }).reviver))
        .throw(/should be string/)

      should(() => JSON.parse('"testtest"', ajvAsIs({ type: 'string', maxLength: 5 }).reviver))
        .throw(/should NOT be longer than 5 characters/)
    })
  })

  describe('any', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', ajvAny().reviver)
        .should.be.exactly('test')

      should(JSON.parse('1', ajvAny().reviver))
        .be.exactly(1)
    })

    it('supports valid values with schema', () => {
      JSON.parse('"test"', ajvAny({ type: 'string' }).reviver)
        .should.be.exactly('test')
    })

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', ajvAny({ type: 'string' }).reviver))
        .throw(/should be string/)
    })
  })

  describe('number', () => {
    it('reports the right type', () => {
      ajvNumber().type.should.be.exactly(Number)
    })

    it('supports missing schema', () => {
      should(JSON.parse('1', ajvNumber().reviver))
        .be.exactly(1)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', ajvNumber({ minimum: 3 }).reviver))
        .be.exactly(4)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', ajvNumber({ minimum: 3 }).reviver))
        .throw(/should be >= 3/)
    })
  })

  describe('number: wrapped json-compatible', () => {
    it('reports the right type', () => {
      ajvNumber({}, { wrap: true }).type.should.be.exactly(M.Number)
    })

    it('supports missing schema', () => {
      should(JSON.parse('1', ajvNumber({}, { wrap: true }).reviver).inner())
        .be.exactly(1)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .be.exactly(4)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be >= 3/)
    })
  })

  describe('number: wrapped non-json-compatible', () => {
    it('supports missing schema', () => {
      should(JSON.parse('"-Infinity"', ajvNumber({}, { wrap: true }).reviver).inner())
        .be.exactly(-Infinity)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('"Infinity"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .be.exactly(Infinity)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('"-Infinity"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be >= 3/)

      should(() => JSON.parse('"1"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be number/)

      should(() => JSON.parse('{"a": 1}', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be number/)
    })
  })

  describe('string', () => {
    it('reports the right type', () => {
      ajvString().type.should.be.exactly(String)
    })

    it('supports missing schema', () => {
      JSON.parse('"test"', ajvString().reviver)
        .should.be.exactly('test')
    })

    it('supports valid strings with schema', () => {
      JSON.parse('"test"', ajvString({ minLength: 3 }).reviver)
        .should.be.exactly('test')
    })

    it('rejects invalid strings', () => {
      should(() => JSON.parse('"aa"', ajvString({ minLength: 3 }).reviver))
        .throw(/shorter than 3 characters/)
    })
  })

  describe('boolean', () => {
    it('reports the right type', () => {
      ajvBoolean().type.should.be.exactly(Boolean)
    })

    it('supports valid booleans', () => {
      JSON.parse('true', ajvBoolean().reviver)
        .should.be.exactly(true)
    })

    it('rejects invalid booleans', () => {
      should(() => JSON.parse('1', ajvBoolean().reviver))
        .throw(/should be boolean/)
    })
  })

  describe('date', () => {
    it('reports the right type', () => {
      ajvDate().type.should.be.exactly(M.Date)
    })

    it('supports valid dates', () => {
      should(JSON.parse('"1988-04-16T00:00:00.000Z"', ajvDate().reviver).inner().getFullYear())
        .be.exactly(1988)
    })

    it('rejects invalid dates', () => {
      should(() => JSON.parse('"1988-04-16T00:00:00.000"', ajvDate().reviver))
        .throw(/should match format "date-time"/)

      should(() => JSON.parse('"1988-04-16"', ajvDate().reviver))
        .throw(/should match format "date-time"/)
    })
  })

  describe('enum', () => {
    it('reports its full schema', () => {
      const Side = M.Enum.fromArray(['A', 'B'])

      M.getSchema(ajvEnum(Side))
        .should.deepEqual({
          type: 'string',
          enum: ['A', 'B']
        })
    })
  })

  describe('enumMap', () => {
    class Side extends M.Enum {
      // workaround for IE <=10
      static innerTypes () {
        return super.innerTypes()
      }
    }

    const SideEnum = M.Enum.fromArray(['A', 'B'], Side, 'Side')

    it('reports its full schema', () => {
      const meta = ajvEnumMap({}, ajv_(SideEnum), ajvNumber())

      M.getSchema(meta)
        .should.deepEqual({
          type: 'object',
          maxProperties: 2,
          additionalProperties: false,
          patternProperties: {
            '^(A|B)$': {
              type: 'number'
            }
          }
        })

      const meta2 = ajvEnumMap({}, ajv_(SideEnum), number())

      M.getSchema(meta2)
        .should.deepEqual({
          type: 'object',
          maxProperties: 2,
          additionalProperties: false,
          patternProperties: {
            '^(A|B)$': {}
          }
        })
    })

    it('reports the right types', () => {
      const meta = ajvEnumMap({}, ajv_(SideEnum), ajvNumber())

      meta.type.should.be.exactly(M.EnumMap)
      meta.subtypes[0].type.should.be.exactly(Side)
      meta.subtypes[1].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      should(JSON.parse('{"B": 100}', ajvEnumMap({}, ajv_(SideEnum), ajvNumber()).reviver).get(SideEnum.B()))
        .be.exactly(100)
    })

    it('supports valid enumMaps with schema', () => {
      should(JSON.parse('{"B": 100}', ajvEnumMap({ minProperties: 1 }, ajv_(SideEnum), ajvNumber()).reviver).get(SideEnum.B()))
        .be.exactly(100)
    })

    it('rejects invalid enumMaps', () => {
      should(() => JSON.parse('{"A": 100}', ajvEnumMap({ minProperties: 2 }, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/should NOT have less than 2 properties/)

      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({}, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/should NOT have more than 2 properties/)

      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({ maxProperties: 3 }, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/Invalid JSON at ""/)
        .and.throw(/should NOT have additional properties/)
    })
  })

  describe('list', () => {
    it('list', () => {
      M.getSchema(ajvList({minItems: 2}, ajvNumber({minimum: 5})))
        .should.deepEqual({
          type: 'array',
          minItems: 2,
          items: {
            type: 'number',
            minimum: 5
          }
        })
    })

    it('reports the right types', () => {
      ajvList({}, ajvString()).type.should.be.exactly(M.List)
      ajvList({}, ajvString()).subtypes[0].type.should.be.exactly(String)
    })

    it('supports empty schema', () => {
      JSON.parse('[2,5]', ajvList({}, ajvNumber()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true)
    })

    it('supports valid lists with schema', () => {
      JSON.parse('[2,5]', ajvList({ maxItems: 3 }, ajvNumber()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true)
    })

    it('rejects invalid lists', () => {
      should(() => JSON.parse('[2,5,7,1]', ajvList({ maxItems: 3 }, ajvNumber()).reviver))
        .throw(/should NOT have more than 3 items/)
    })
  })

  describe('map', () => {
    it('reports its full schema', () => {
      const meta = ajvMap({}, ajvNumber(), ajvString())

      M.getSchema(meta)
        .should.deepEqual({
          'type': 'array',
          'items': {
            'type': 'array',
            'maxItems': 2,
            'minItems': 2,
            'items': [
              { 'type': 'number' },
              { 'type': 'string' }
            ]
          }
        })
    })

    it('reports the right types', () => {
      const meta = ajvMap({}, ajvNumber(), ajvString())

      meta.type.should.be.exactly(M.Map)
      meta.subtypes[0].type.should.be.exactly(Number)
      meta.subtypes[1].type.should.be.exactly(String)
    })

    it('supports empty schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', ajvMap({}, ajvNumber(), ajvString()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true)
    })

    it('supports valid maps with schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', ajvMap({ minItems: 2 }, ajvNumber(), ajvString()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true)
    })

    it('rejects invalid maps', () => {
      should(() => JSON.parse('[[2, "dos", "extra"]]', ajvMap({}, ajvNumber(), ajvString()).reviver))
        .throw(/should NOT have more than 2 items/)

      should(() => JSON.parse('[[2]]', ajvMap({}, ajvNumber(), ajvString()).reviver))
        .throw(/should NOT have less than 2 items/)

      should(() => JSON.parse('[[1, "uno"], [2, "dos"], [3, "tres"]]', ajvMap({ minItems: 4 }, ajvNumber(), ajvString()).reviver))
        .throw(/should NOT have less than 4 items/)
    })
  })

  describe('stringMap', () => {
    it('reports its full schema', () => {
      const meta = ajvStringMap({}, ajvNumber())

      M.getSchema(meta)
        .should.deepEqual({
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
      const meta = ajvStringMap({}, ajvNumber())

      meta.type.should.be.exactly(M.StringMap)
      meta.subtypes[0].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      should(JSON.parse('{"uno": 1}', ajvStringMap({}, ajvNumber()).reviver).get('uno'))
        .be.exactly(1)
    })

    it('supports valid stringMaps with schema', () => {
      should(JSON.parse('{"uno": 1}', ajvStringMap({ minProperties: 1 }, ajvNumber()).reviver).get('uno'))
        .be.exactly(1)
    })

    it('rejects invalid stringMaps', () => {
      should(() => JSON.parse('{"uno": 1}', ajvStringMap({ minProperties: 2 }, ajvNumber()).reviver))
        .throw(/should NOT have less than 2 properties/)
    })
  })

  describe('set', () => {
    it('reports its full schema', () => {
      const meta = ajvSet({}, ajvNumber())

      M.getSchema(meta)
        .should.deepEqual({
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'number'
          }
        })
    })

    it('reports the right types', () => {
      ajvSet({}, ajvNumber()).type.should.be.exactly(M.Set)
      ajvSet({}, ajvNumber()).subtypes[0].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      JSON.parse('[2,5]', ajvSet({}, ajvNumber()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })

    it('supports valid sets with schema', () => {
      JSON.parse('[2,5]', ajvSet({ maxItems: 3 }, ajvNumber()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })

    it('rejects invalid sets', () => {
      should(() => JSON.parse('[2,5,7,1]', ajvSet({ maxItems: 3 }, ajvNumber()).reviver))
        .throw(/should NOT have more than 3 items/)
    })

    it('rejects duplicated values by default', () => {
      should(() => JSON.parse('[2,5,5]', ajvSet({}, ajvNumber()).reviver))
        .throw(/should NOT have duplicate items/)
    })

    it('supports duplicates when explicitly told', () => {
      JSON.parse('[2,5,5]', ajvSet({ uniqueItems: false }, ajvNumber()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })
  })

  describe('maybe', () => {
    it('reports the right types', () => {
      ajvMaybe(ajvString()).type.should.be.exactly(M.Maybe)
      ajvMaybe(ajvString()).subtypes[0].type.should.be.exactly(String)
    })

    it('behaves just as the normal maybe metadata', () => {
      JSON.parse('null', ajvMaybe(ajvString()).reviver)
        .getOrElse('fallback')
        .should.be.exactly('fallback')

      JSON.parse('"Javier"', ajvMaybe(ajvString()).reviver)
        .getOrElse('fallback')
        .should.be.exactly('Javier')
    })
  })

  describe('ajvWithDefault', () => {
    it('should validate the default value', () => {
      class CountryCode extends M.Base {
        constructor (props) {
          super(CountryCode, props)
        }

        static innerTypes () {
          return Object.freeze({
            value: ajvWithDefault(ajvString({minLength: 3, maxLength: 3}), 'SPAIN')
          })
        }
      }

      (() => new CountryCode())
        .should.throw(/should NOT be longer than 3 characters/)
    })
  })

  describe('recipe: validate within the constructor', () => {
    const ajv = Ajv()

    it('should validate the default value', () => {
      class CountryCode extends M.Base {
        constructor (props) {
          if (!ajv.validate(ajv_(CountryCode).schema(), props)) {
            throw TypeError(ajv.errors[0].message)
          }

          super(CountryCode, props)
        }

        static innerTypes () {
          return Object.freeze({
            value: ajvWithDefault(ajvString({minLength: 3, maxLength: 3}), 'ESP')
          })
        }
      }

      (() => new CountryCode({value: 'SPAIN'}))
        .should.throw(/should NOT be longer than 3 characters/)

      const australia = new CountryCode({value: 'AUS'})

      should(() => australia.set('value', 'AU'))
        .throw(/should NOT be shorter than 3 characters/)
    })
  })

  describe('recipe: validation at top level', () => {
    class Animal extends M.Base {
      constructor (props) {
        super(Animal, props)
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvString()
        })
      }
    }

    const baseSchema = M.getSchema(base(Animal))

    const enhancedMeta = additionalProperties =>
      ajvBase(
        Animal,
        Object.assign({}, baseSchema, { additionalProperties })
      )

    it('supports additional properties unless otherwise stated', () => {
      should(() => ajvBase(Animal).reviver('', {
        name: 'Bane',
        extra: 1
      })).not.throw()

      should(() => enhancedMeta(true).reviver('', {
        name: 'Bane',
        extra: 1
      })).not.throw()

      M.getSchema(enhancedMeta(true))
        .should.deepEqual({
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
      should(() => enhancedMeta(false).reviver('', {
        name: 'Bane',
        extra: 1
      })).throw(/should NOT have additional properties/)

      M.getSchema(enhancedMeta(false))
        .should.deepEqual({
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
      should(() => M.ajvFromJSON(ajv_, Animal, { maxProperties: 2 }, `{
        "name": "Bane",
        "dimensions": [20, 55, 65],
        "extra": 1
      }`))
        .throw(/should NOT have more than 2 properties/)
    })
  })

  describe('withValidation', () => {
    it('facilitates custom validation rules', () => {
      const lowerCaseString = schema => M.withValidation(
        v => v.toLowerCase() === v,
        (v, path) => `string ${v} at "${path.join(' > ')}" is not all lower case`,
      )(ajvString(schema))

      JSON.parse('"abc123"', lowerCaseString({minLength: 5}).reviver)
        .should.be.exactly('abc123')

      should(() => JSON.parse('"abc"', lowerCaseString({minLength: 5}).reviver))
        .throw(/should NOT be shorter than 5 characters/)

      should(() => JSON.parse('"aBc123"', lowerCaseString({minLength: 5}).reviver))
        .throw(/string aBc123 at "" is not all lower case/)
    })

    it('should have a default error message', () => {
      const lowerCaseString = schema => M.withValidation(v => v.toLowerCase() === v)(ajvString(schema))

      should(() => JSON.parse('"aBc123"', lowerCaseString({minLength: 5}).reviver))
        .throw(/Invalid value at ""/)
    })

    it('should work for nested metadata', () => {
      const lowerCaseString = schema => M.withValidation(
        v => v.toLowerCase() === v,
        (v, path) => `string ${v} at "${path.join(' > ')}" is not all lower case`
      )(ajvString(schema))

      class MagicString extends M.Base {
        constructor (props) {
          super(MagicString, props)
        }

        static innerTypes () {
          return Object.freeze({
            str: lowerCaseString({minLength: 5})
          })
        }
      }

      M.fromJSON(MagicString, '{"str": "abc123"}').str()
        .should.be.exactly('abc123')

      should(() => M.fromJSON(MagicString, '{"str": "abc"}'))
        .throw(/should NOT be shorter than 5 characters/)

      should(() => M.fromJSON(MagicString, '{"str": "aBc123"}'))
        .throw(/string aBc123 at "str" is not all lower case/)

      should(() => JSON.parse(
        '{"str": "abc123", "forceFail": true}',
        M.withValidation(v => M.fields(v).forceFail !== true, () => 'forcibly failed')(_(MagicString)).reviver
      )).throw(/forcibly failed/)
    })
  })
}
