/* eslint-env mocha */

import CityFactory from '../types/fixtures/nested/City'
import RegionFactory from '../types/fixtures/nested/Region'
import RegionIncompatibleNameKeyFactory from '../types/fixtures/nested/RegionIncompatibleNameKey'

export default (should, M) => () => {
  const { _ } = M.metadata

  it('should revive deeply nested JSON', () => {
    const City = CityFactory(M, RegionFactory(M))
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}`

    const city = JSON.parse(cityJson, _(City).reviver)

    city.name().should.be.exactly('Pamplona')
    city.country().name().should.be.exactly('Spain')
    city.country().code().should.be.exactly('ESP')
    city.country().region().customMethod().should.be.exactly('Europe (EU)')
  })

  it('should support nested keys with different types', () => {
    const City = CityFactory(M, RegionIncompatibleNameKeyFactory(M))
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":{"id": 1,"value":"EU"}}}}`

    const city = JSON.parse(cityJson, _(City).reviver)

    city.name().should.be.exactly('Pamplona')
    city.country().name().should.be.exactly('Spain')
    city.country().code().should.be.exactly('ESP')
    city.country().region().customMethod().should.be.exactly('Europe (EU)')
  })
}
