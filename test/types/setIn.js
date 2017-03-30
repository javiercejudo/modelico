/* eslint-env mocha */

export default (U, should, M) => () => {
  it('should work across types', () => {
    const hammer = M.Map.of('hammer', 'Can’t Touch This')
    const array1 = M.List.of('totally', 'immutable', hammer)

    should(() => { array1.inner()[1] = 'I’m going to mutate you!' })
      .throw()

    array1.get(1).should.be.exactly('immutable')

    array1.setIn([2, 'hammer'], 'hm, surely I can mutate this nested object...')

    array1.get(2).inner().get('hammer')
      .should.be.exactly('Can’t Touch This')
  })

  it('should work across types (2)', () => {
    const list = M.List.of('totally', 'immutable')
    const hammer1 = M.Map.fromObject({hammer: 'Can’t Touch This', list})

    hammer1.inner().set('hammer', 'I’m going to mutate you!')
    hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This')

    hammer1.setIn(['list', 1], 'hm, surely I can mutate this nested object...')

    hammer1.inner().get('list').get(1)
      .should.be.exactly('immutable')
  })
}
