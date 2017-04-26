/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  const {any, number, withDefault, ajvNumber} = M.ajvMetadata(Ajv())

  it('should have a proper reviver', () => {
    JSON.parse('null', withDefault(number(), 1).reviver).should.be.exactly(1)
    JSON.parse('2', withDefault(number(), 1).reviver).should.be.exactly(2)

    JSON.parse(
      'null',
      withDefault(any(), {foo: 0}).reviver
    ).foo.should.be.exactly(0)

    JSON.parse(
      '{"foo": 1}',
      withDefault(any(), {foo: 0}).reviver
    ).foo.should.be.exactly(1)
  })

  it('should validate the default value', () => {
    should(() =>
      JSON.parse('null', withDefault(ajvNumber({minimum: 5}), 1).reviver)
    ).throw(/should be >= 5/)
  })

  it('should work well with ajvMetadata', () => {
    JSON.parse('null', withDefault(ajvNumber(), 1).reviver).should.be.exactly(1)
    JSON.parse('2', withDefault(ajvNumber(), 1).reviver).should.be.exactly(2)

    should(() => {
      JSON.parse('2', withDefault(ajvNumber({minimum: 5}), 1).reviver)
    }).throw(/should be >= 5/)
  })
}
