/* eslint-env mocha */

export default (U, should, M) => () => {
  const objToArr = U.objToArr

  it('Getting started', () => {
    const map1 = M.Map.fromObject({a: 1, b: 2, c: 3})
    const map2 = map1.set('b', 50)
    should(map1.inner().get('b')).be.exactly(2)
    should(map2.inner().get('b')).be.exactly(50)
  })

  it('The case for Immutability', () => {
    const map1 = M.Map.fromObject({a: 1, b: 2, c: 3})
    const map2 = map1.set('b', 2)
    map1.equals(map2).should.be.exactly(true)
    const map3 = map1.set('b', 50)
    map1.equals(map3).should.be.exactly(false)
  })

  it('JavaScript-first API', () => {
    const list1 = M.List.of(1, 2)

    const list2Array = [...list1]
    list2Array.push(3, 4, 5)
    const list2 = M.List.fromArray(list2Array)

    const list3Array = [...list2]
    list3Array.unshift(0)
    const list3 = M.List.fromArray(list3Array)

    const list4 = M.List.fromArray([...list1].concat([...list2], [...list3]))

    should(list1.size === 2).be.exactly(true)
    should(list2.size === 5).be.exactly(true)
    should(list3.size === 6).be.exactly(true)
    should(list4.size === 13).be.exactly(true)
    should(list4.get(0) === 1).be.exactly(true)
  })

  it('JavaScript-first API (2)', () => {
    const alpha = M.Map.fromObject({a: 1, b: 2, c: 3, d: 4})
    ;[...alpha]
      .map(kv => kv[0].toUpperCase())
      .join()
      .should.be.exactly('A,B,C,D')
  })

  it('Accepts raw JavaScript objects.', () => {
    const map1 = M.Map.fromObject({a: 1, b: 2, c: 3, d: 4})
    const map2 = M.Map.fromObject({c: 10, a: 20, t: 30})

    const obj = {d: 100, o: 200, g: 300}

    const map3 = M.Map.fromMap(
      new Map([].concat([...map1], [...map2], objToArr(obj)))
    )

    map3
      .equals(
        M.Map.fromObject({
          a: 20,
          b: 2,
          c: 10,
          d: 100,
          t: 30,
          o: 200,
          g: 300
        })
      )
      .should.be.exactly(true)
  })

  it('Accepts raw JavaScript objects. (2)', () => {
    const myObject = {a: 1, b: 2, c: 3}

    objToArr(myObject)
      .reduce((acc, kv) => {
        acc[kv[0]] = Math.pow(kv[1], 2)
        return acc
      }, {})
      .should.eql({a: 1, b: 4, c: 9})
  })

  it('Accepts raw JavaScript objects. (3)', () => {
    const obj = {1: 'one'}
    Object.keys(obj)[0].should.be.exactly('1')
    obj['1'].should.be.exactly('one')
    obj[1].should.be.exactly('one')

    const map = M.Map.fromObject(obj)
    map
      .inner()
      .get('1')
      .should.be.exactly('one')
    should(map.inner().get(1)).be.exactly(undefined)
  })

  it('Equality treats Collections as Data', () => {
    const map1 = M.Map.fromObject({a: 1, b: 1, c: 1})
    const map2 = M.Map.fromObject({a: 1, b: 1, c: 1})

    should(map1 !== map2).be.exactly(true) // two different instances
    map1.equals(map2).should.be.exactly(true) // have equivalent values
  })

  it('Batching Mutations', () => {
    const list1 = M.List.of(1, 2, 3)
    const list2Array = [...list1]
    list2Array.push(4, 5, 6)
    const list2 = M.List.fromArray(list2Array)

    should([...list1].length === 3).be.exactly(true)
    should([...list2].length === 6).be.exactly(true)
  })
}
