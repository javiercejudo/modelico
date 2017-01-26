/* eslint-env mocha */

export default (should, M, fixtures, { Ajv }) => () => {
  const {
    _,
    asIs,
    any,
    string,
    number,
    boolean,
    date,
    enumMap,
    list,
    map,
    stringMap,
    set,
    maybe
  } = M.ajvMetadata(Ajv())

  describe('Animal example', () => {
    it('should revive as usual with valid JSON and fail otherwise', () => {
      class Animal extends M.Base {
        constructor (fields) {
          super(Animal, fields)
        }

        static innerTypes () {
          return Object.freeze({
            name: string({ minLength: 1, maxLength: 25 }),
            dimensions: list({ minItems: 3, maxItems: 3 }, number({ minimum: 0, exclusiveMinimum: true }))
          })
        }
      }

      const bane1 = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      })

      bane1.name().should.be.exactly('Bane')

      bane1.dimensions().equals(M.List.of(20, 55, 65))
        .should.be.exactly(true)

      should(() => M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 0]
      })).throw(/should be > 0/)
    })
  })

  describe('togglability', () => {
    const { string: nonValidatedString } = M.ajvMetadata()

    it('defaults to normal behaviour when Ajv is undefined', () => {
      JSON.parse('"aa"', nonValidatedString({ minLength: 3 }).reviver)
        .should.be.exactly('aa')

      should(() => JSON.parse('"aa"', string({ minLength: 3 }).reviver))
        .throw(/shorter than 3 characters/)
    })
  })

  describe('asIs', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', asIs().reviver)
        .should.be.exactly('test')
    })

    it('supports valid values with schema', () => {
      JSON.parse('"test"', asIs({ type: 'string' }).reviver)
        .should.be.exactly('test')
    })

    it('supports valid values with schema and transformer', () => {
      JSON.parse('"test"', asIs({ type: 'string', maxLength: 5 }, x => x.repeat(2)).reviver)
        .should.be.exactly('testtest')
    })

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', asIs({ type: 'string' }).reviver))
        .throw(/should be string/)

      should(() => JSON.parse('"testtest"', asIs({ type: 'string', maxLength: 5 }).reviver))
        .throw(/should NOT be longer than 5 characters/)
    })
  })

  describe('any', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', any().reviver)
        .should.be.exactly('test')

      should(JSON.parse('1', any().reviver))
        .be.exactly(1)
    })

    it('supports valid values with schema', () => {
      JSON.parse('"test"', any({ type: 'string' }).reviver)
        .should.be.exactly('test')
    })

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', any({ type: 'string' }).reviver))
        .throw(/should be string/)
    })
  })

  describe('number', () => {
    it('reports the right type', () => {
      number().type.should.be.exactly(Number)
    })

    it('supports missing schema', () => {
      should(JSON.parse('1', number().reviver))
        .be.exactly(1)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', number({ minimum: 3 }).reviver))
        .be.exactly(4)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', number({ minimum: 3 }).reviver))
        .throw(/should be >= 3/)
    })
  })

  describe('number: wrapped json-compatible', () => {
    it('reports the right type', () => {
      number({}, { wrap: true }).type.should.be.exactly(M.Number)
    })

    it('supports missing schema', () => {
      should(JSON.parse('1', number({}, { wrap: true }).reviver).inner())
        .be.exactly(1)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', number({ minimum: 3 }, { wrap: true }).reviver).inner())
        .be.exactly(4)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', number({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be >= 3/)
    })
  })

  describe('number: wrapped non-json-compatible', () => {
    it('supports missing schema', () => {
      should(JSON.parse('"-Infinity"', number({}, { wrap: true }).reviver).inner())
        .be.exactly(-Infinity)
    })

    it('supports valid numbers with schema', () => {
      should(JSON.parse('"Infinity"', number({ minimum: 3 }, { wrap: true }).reviver).inner())
        .be.exactly(Infinity)
    })

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('"-Infinity"', number({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be >= 3/)

      should(() => JSON.parse('"1"', number({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be number/)

      should(() => JSON.parse('{"a": 1}', number({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be number/)
    })
  })

  describe('string', () => {
    it('reports the right type', () => {
      string().type.should.be.exactly(String)
    })

    it('supports missing schema', () => {
      JSON.parse('"test"', string().reviver)
        .should.be.exactly('test')
    })

    it('supports valid strings with schema', () => {
      JSON.parse('"test"', string({ minLength: 3 }).reviver)
        .should.be.exactly('test')
    })

    it('rejects invalid strings', () => {
      should(() => JSON.parse('"aa"', string({ minLength: 3 }).reviver))
        .throw(/shorter than 3 characters/)
    })
  })

  describe('boolean', () => {
    it('reports the right type', () => {
      boolean().type.should.be.exactly(Boolean)
    })

    it('supports valid booleans', () => {
      JSON.parse('true', boolean().reviver)
        .should.be.exactly(true)
    })

    it('rejects invalid booleans', () => {
      should(() => JSON.parse('1', boolean().reviver))
        .throw(/should be boolean/)
    })
  })

  describe('date', () => {
    it('reports the right type', () => {
      date().type.should.be.exactly(M.Date)
    })

    it('supports valid dates', () => {
      should(JSON.parse('"1988-04-16T00:00:00.000Z"', date().reviver).inner().getFullYear())
        .be.exactly(1988)
    })

    it('rejects invalid dates', () => {
      should(() => JSON.parse('"1988-04-16T00:00:00.000"', date().reviver))
        .throw(/should match format "date-time"/)

      should(() => JSON.parse('"1988-04-16"', date().reviver))
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
      const meta = enumMap({}, _(SideEnum), number())

      meta.type.should.be.exactly(M.EnumMap)
      meta.subtypes[0].type.should.be.exactly(Side)
      meta.subtypes[1].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      should(JSON.parse('{"B": 100}', enumMap({}, _(SideEnum), number()).reviver).get(SideEnum.B()))
        .be.exactly(100)
    })

    it('supports valid enumMaps with schema', () => {
      should(JSON.parse('{"B": 100}', enumMap({ minProperties: 1 }, _(SideEnum), number()).reviver).get(SideEnum.B()))
        .be.exactly(100)
    })

    it('rejects invalid enumMaps', () => {
      should(() => JSON.parse('{"A": 100}', enumMap({ minProperties: 2 }, _(SideEnum), number()).reviver))
        .throw(/should NOT have less than 2 properties/)

      // limits the amount of properties to the number of enumerators
      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', enumMap({ minProperties: 1 }, _(SideEnum), number()).reviver))
        .throw(/should NOT have more than 2 properties/)

      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', enumMap({ maxProperties: 3 }, _(SideEnum), number()).reviver))
        .throw(/missing enumerator \(C\)/)
    })
  })

  describe('list', () => {
    it('reports the right types', () => {
      list({}, string()).type.should.be.exactly(M.List)
      list({}, string()).subtypes[0].type.should.be.exactly(String)
    })

    it('supports empty schema', () => {
      JSON.parse('[2,5]', list({}, number()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true)
    })

    it('supports valid lists with schema', () => {
      JSON.parse('[2,5]', list({ maxItems: 3 }, number()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true)
    })

    it('rejects invalid lists', () => {
      should(() => JSON.parse('[2,5,7,1]', list({ maxItems: 3 }, number()).reviver))
        .throw(/should NOT have more than 3 items/)
    })
  })

  describe('map', () => {
    it('reports the right types', () => {
      const meta = map({}, number(), string())

      meta.type.should.be.exactly(M.Map)
      meta.subtypes[0].type.should.be.exactly(Number)
      meta.subtypes[1].type.should.be.exactly(String)
    })

    it('supports empty schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', map({}, number(), string()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true)
    })

    it('supports valid maps with schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', map({ minItems: 2 }, number(), string()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true)
    })

    it('rejects invalid maps', () => {
      should(() => JSON.parse('[[2, "dos", "extra"]]', map({}, number(), string()).reviver))
        .throw(/should NOT have more than 2 items/)

      should(() => JSON.parse('[[2]]', map({}, number(), string()).reviver))
        .throw(/should NOT have less than 2 items/)

      should(() => JSON.parse('[[1, "uno"], [2, "dos"], [3, "tres"]]', map({ minItems: 4 }, number(), string()).reviver))
        .throw(/should NOT have less than 4 items/)
    })
  })

  describe('stringMap', () => {
    it('reports the right types', () => {
      const meta = stringMap({}, number())

      meta.type.should.be.exactly(M.StringMap)
      meta.subtypes[0].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      should(JSON.parse('{"uno": 1}', stringMap({}, number()).reviver).get('uno'))
        .be.exactly(1)
    })

    it('supports valid stringMaps with schema', () => {
      should(JSON.parse('{"uno": 1}', stringMap({ minProperties: 1 }, number()).reviver).get('uno'))
        .be.exactly(1)
    })

    it('rejects invalid stringMaps', () => {
      should(() => JSON.parse('{"uno": 1}', stringMap({ minProperties: 2 }, number()).reviver))
        .throw(/should NOT have less than 2 properties/)
    })
  })

  describe('set', () => {
    it('reports the right types', () => {
      set({}, number()).type.should.be.exactly(M.Set)
      set({}, number()).subtypes[0].type.should.be.exactly(Number)
    })

    it('supports empty schema', () => {
      JSON.parse('[2,5]', set({}, number()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })

    it('supports valid sets with schema', () => {
      JSON.parse('[2,5]', set({ maxItems: 3 }, number()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true)
    })

    it('rejects invalid sets', () => {
      should(() => JSON.parse('[2,5,7,1]', set({ maxItems: 3 }, number()).reviver))
        .throw(/should NOT have more than 3 items/)
    })

    it('rejects duplicated values by default', () => {
      should(() => JSON.parse('[2,5,5]', set({}, number()).reviver))
        .throw(/should NOT have duplicate items/)
    })

    it('supports duplicates when explicitly told', () => {
      JSON.parse('[2,5,5]', set({ uniqueItems: false }, number()).reviver)
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
  })
}
