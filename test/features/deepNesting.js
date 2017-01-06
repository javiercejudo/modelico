/* eslint-env mocha */

export default (should, M, fixtures) => () => {
  const { _ } = M.metadata

  it('should revive deeply nested JSON', () => {
    const { Region, countryFactory } = fixtures
    const City = fixtures.cityFactory(M, Region, countryFactory)
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}`

    const city = JSON.parse(cityJson, _(City).reviver)

    city.name().should.be.exactly('Pamplona')
    city.country().name().should.be.exactly('Spain')
    city.country().code().should.be.exactly('ESP')
    city.country().region().customMethod().should.be.exactly('Europe (EU)')
  })

  it('should support nested keys with different types', () => {
    const { RegionIncompatibleNameKey: Region, countryFactory } = fixtures
    const City = fixtures.cityFactory(M, Region, countryFactory)
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":{"id": 1,"value":"EU"}}}}`

    const city = JSON.parse(cityJson, _(City).reviver)

    city.name().should.be.exactly('Pamplona')
    city.country().name().should.be.exactly('Spain')
    city.country().code().should.be.exactly('ESP')
    city.country().region().customMethod().should.be.exactly('Europe (EU)')
  })
}
