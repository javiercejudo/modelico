/* eslint-env mocha */

export default (should, M, {Person}, {Ajv}) => () => {
  describe('normal metadata', () => {
    const m = M.metadata()

    it('metadata', () => {
      m.should.be.exactly(M.metadata())
    })

    it('_', () => {
      m._(Person).should.be.exactly(m._(Person))

      const itemMetadata = [m.string()]
      m._(M.List, itemMetadata).should.be.exactly(m._(M.List, itemMetadata))
    })

    it('base', () => {
      m.base(Person).should.be.exactly(m.base(Person))
    })

    it('asIs', () => {
      m.asIs().should.be.exactly(m.asIs())

      const double = x => 2 * x
      m.asIs(double).should.be.exactly(m.asIs(double))
    })

    it('any', () => {
      m.any().should.be.exactly(m.any())
    })

    it('number', () => {
      m.number().should.be.exactly(m.number())
    })

    it('wrappedNumber', () => {
      m.wrappedNumber().should.be.exactly(m.wrappedNumber())
      M.Number.metadata().should.be.exactly(m.wrappedNumber())
    })

    it('string', () => {
      m.string().should.be.exactly(m.string())
    })

    it('boolean', () => {
      m.boolean().should.be.exactly(m.boolean())
    })

    it('date', () => {
      m.date().should.be.exactly(m.date())
      M.Date.metadata().should.be.exactly(m.date())
    })

    it('enumMap', () => {
      const Currency = M.Enum.fromArray(['AUD', 'EUR'])

      m
        .enumMap(m._(Currency), m.number())
        .should.be.exactly(m.enumMap(m._(Currency), m.number()))
    })

    it('list', () => {
      m.list(m.number()).should.be.exactly(m.list(m.number()))
    })

    it('map', () => {
      m.map(m.date(), m.number()).should.be.exactly(m.map(m.date(), m.number()))
    })

    it('stringMap', () => {
      m.stringMap(m.number()).should.be.exactly(m.stringMap(m.number()))
    })

    it('set', () => {
      m.set(m.number()).should.be.exactly(m.set(m.number()))
    })

    it('maybe', () => {
      m.maybe(m.number(), 0).should.be.exactly(m.maybe(m.number(), 0))
    })

    it('withDefault', () => {
      m
        .withDefault(m.number(), 0)
        .should.be.exactly(m.withDefault(m.number(), 0))
    })
  })

  describe('Ajv metadata', () => {
    const ajv = Ajv()
    const m = M.ajvMetadata(ajv)

    it('metadata', () => {
      m.should.be.exactly(M.ajvMetadata(ajv))
      m.should.not.be.exactly(M.ajvMetadata(Ajv()))
    })

    it('_', () => {
      m._(Person).should.be.exactly(m._(Person))

      const itemMetadata = [m.string()]
      m._(M.List, itemMetadata).should.be.exactly(m._(M.List, itemMetadata))

      const nonEmpty = {minItems: 1}

      m
        ._(M.List, itemMetadata, nonEmpty)
        .should.be.exactly(m._(M.List, itemMetadata, nonEmpty))
    })

    it('base', () => {
      m.base(Person).should.be.exactly(m.base(Person))

      const schema = {additionalProperties: false}
      m.base(Person, schema).should.be.exactly(m.base(Person, schema))
    })

    it('asIs', () => {
      m.asIs().should.be.exactly(m.asIs())

      const double = x => 2 * x
      const numberSchema = {type: 'number'}

      m
        .asIs(double, numberSchema)
        .should.be.exactly(m.asIs(double, numberSchema))
    })

    it('any', () => {
      m.any().should.be.exactly(m.any())

      const stringOrNumber = {anyOf: [{type: 'string'}, {type: 'number'}]}
      m.any(stringOrNumber).should.be.exactly(m.any(stringOrNumber))
    })

    it('number', () => {
      m.number().should.be.exactly(m.number())

      const nonNegative = {minimum: 0}
      m.number(nonNegative).should.be.exactly(m.number(nonNegative))
    })

    it('wrappedNumber', () => {
      m.wrappedNumber().should.be.exactly(m.wrappedNumber())

      const nonNegative = {minimum: 0}

      m
        .wrappedNumber(nonNegative)
        .should.be.exactly(m.wrappedNumber(nonNegative))
    })

    it('string', () => {
      m.string().should.be.exactly(m.string())

      const nonEmpty = {minLength: 1}
      m.string(nonEmpty).should.be.exactly(m.string(nonEmpty))
    })

    it('boolean', () => {
      m.boolean().should.be.exactly(m.boolean())

      const defaultToFalse = {default: false}
      m.boolean(defaultToFalse).should.be.exactly(m.boolean(defaultToFalse))
    })

    it('date', () => {
      m.date().should.be.exactly(m.date())
    })

    it('enumMap', () => {
      const Currency = M.Enum.fromArray(['AUD', 'EUR'])

      m
        .enumMap(m._enum(Currency), m.number())
        .should.be.exactly(m.enumMap(m._enum(Currency), m.number()))

      const schema = {description: 'currency rates'}

      m
        .enumMap(m._(Currency), m.number(), schema)
        .should.be.exactly(m.enumMap(m._(Currency), m.number(), schema))
    })

    it('list', () => {
      m.list(m.number()).should.be.exactly(m.list(m.number()))

      const nonNegative = {minimum: 0}
      const nonEmpty = {minItems: 1}

      m
        .list(m.number(nonNegative), nonEmpty)
        .should.be.exactly(m.list(m.number(nonNegative), nonEmpty))
    })

    it('map', () => {
      m.map(m.date(), m.number()).should.be.exactly(m.map(m.date(), m.number()))

      const schema = {description: 'historic numbers'}
      const nonNegative = {minimum: 0}

      m
        .map(m.date(), m.number(nonNegative), schema)
        .should.be.exactly(m.map(m.date(), m.number(nonNegative), schema))
    })

    it('set', () => {
      m.set(m.number()).should.be.exactly(m.set(m.number()))

      const nonNegative = {minimum: 0}
      const nonEmpty = {minItems: 1}

      m
        .set(m.number(nonNegative), nonEmpty)
        .should.be.exactly(m.set(m.number(nonNegative), nonEmpty))
    })

    it('stringMap', () => {
      m.stringMap(m.number()).should.be.exactly(m.stringMap(m.number()))

      const schema = {description: 'some numbers'}
      const nonNegative = {minimum: 0}

      m
        .stringMap(m.number(nonNegative), schema)
        .should.be.exactly(m.stringMap(m.number(nonNegative), schema))
    })

    it('maybe', () => {
      m.maybe(m.number()).should.be.exactly(m.maybe(m.number()))

      const schema = {description: 'maybe a number'}
      const nonNegative = {minimum: 0}

      m
        .maybe(m.number(nonNegative), schema)
        .should.be.exactly(m.maybe(m.number(nonNegative), schema))
    })

    it('withDefault', () => {
      m
        .withDefault(m.number(), 0)
        .should.be.exactly(m.withDefault(m.number(), 0))

      const schema = {description: 'some number'}
      const nonNegative = {minimum: 0}

      m
        .withDefault(m.number(nonNegative), 0, schema)
        .should.be.exactly(m.withDefault(m.number(nonNegative), 0, schema))
    })
  })

  describe('M.util.mem', () => {
    it('memoises nullary & unary functions', () => {
      const state = {counter: 0}

      const fn = M.util.mem(n => {
        state.counter += n
        return state.counter
      }, () => new Map())

      fn(2).should.be.exactly(2)
      fn(1).should.be.exactly(3)
      fn(2).should.be.exactly(2)
      fn(1).should.be.exactly(3)
      fn(5).should.be.exactly(8)
      fn(1).should.be.exactly(3)

      // incidentally, any memoised function with M.util.mem can bypass the
      // cache by passing 2 or more
      fn(1, {anyOtherArg: true}).should.be.exactly(9)
      fn(1, undefined).should.be.exactly(10)
    })

    it('exposes a way retrieve the cache and reset it', () => {
      const mem = M.util.memFactory()
      const state = {counter: 5}

      const counter = n => {
        state.counter += n
        return state.counter
      }

      const fn = mem(counter, () => new Map())

      fn(1).should.be.exactly(6)
      fn(2).should.be.exactly(8)
      fn(1).should.be.exactly(6)

      const cacheRegistry = mem.cache()

      cacheRegistry.has(counter).should.be.exactly(true)
      const fnCache = cacheRegistry.get(counter)

      fnCache.has(1).should.be.exactly(true)
      fnCache.has(4).should.be.exactly(false)

      mem
        .clear()
        .cache()
        .has(counter)
        .should.be.exactly(false)
    })
  })
}
