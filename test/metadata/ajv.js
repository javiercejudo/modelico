/* eslint-env mocha */

export default (should, M, fixtures, { Ajv }) => () => {
  const {
    ajv_,
    ajvAsIs,
    ajvAny,
    ajvString,
    ajvNumber,
    ajvBoolean,
    ajvDate,
    ajvEnumMap,
    ajvList,
    ajvMap,
    ajvStringMap,
    ajvSet,
    ajvMaybe,
    ajvWithDefault
  } = M.ajvMetadata(Ajv())

  describe('Animal example', () => {
    class Animal extends M.createModel({
      name: ajvWithDefault(ajvString({ minLength: 1, maxLength: 25 }), 'unknown'),
      dimensions:
        ajvMaybe(
          ajvList({ minItems: 3, maxItems: 3 },
            ajvNumber({ minimum: 0, exclusiveMinimum: true })))
    }) {
      constructor (props) {
        super(Animal, props)
      }
    }

    class Animal2 extends M.createModel({
      name: ajvString({ minLength: 1, maxLength: 25 }),
      dimensions:
        ajvMaybe(
          ajvList({ minItems: 3, maxItems: 3 },
            ajvNumber({ minimum: 0, exclusiveMinimum: true })))
    }) {
      constructor (props) {
        super(Animal, props)
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

    it('should fail with additional properties if they are not allowed', () => {
      should(() => M.ajvFromJSON(ajv_, Animal, { additionalProperties: false }, `{
        "name": "Bane",
        "dimensions": [20, 55, 65],
        "extra": 1
      }`))
        .throw(/should NOT have additional properties/)
    })

    it('should be able to return the whole schema', () => {
      const bane = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      })

      const animalSchema = M.getSchema(ajv_(Animal))

      animalSchema.should.deepEqual({
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
            items: {
              type: 'number',
              exclusiveMinimum: true,
              minimum: 0
            }
          }
        },
        required: ['name']
      })

      const ajv = Ajv()

      ajv.validate(animalSchema, bane.toJS())
        .should.be.exactly(true)

      ajv.validate(animalSchema, bane.set('name', 'Robbie').toJS())
        .should.be.exactly(true)

      ajv.validate(animalSchema, bane.set('name', 2).toJS())
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
        .throw(/missing enumerator "D" at "A > B"/)
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

  describe('enumMap', () => {
    class Side extends M.Enum {
      static innerTypes () {
        return M.Enum.innerTypes()
      }
    }

    const SideEnum = M.Enum.fromArray(['A', 'B'], Side, 'Side')

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

      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({ maxProperties: 3 }, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/missing enumerator "C" at ""/)
    })
  })

  describe('list', () => {
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
}
