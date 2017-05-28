/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  it('only works with Modelico instances', () => {
    const {withDefault, number} = M.ajvMetadata(Ajv())

    const res = JSON.parse(
      'null',
      withDefault(number({}, {minimum: 5}), 1).reviver
    )

    res.should.be.exactly(1)

    should(() => M.validate(res)).throw(
      'Modelico.validate only works with instances of Modelico.Base'
    )
  })
}
