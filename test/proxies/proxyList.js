/* eslint-env mocha */

export default (should, M) => () => {
  const p = M.proxyList

  it('length', () => {
    const list1 = p(M.List.of(1, 2, 2, 3))

    should(list1.length).be.exactly(4)
  })

  it('[n]', () => {
    const list1 = p(M.List.of(1, 2, 2, 3))

    list1.get(0).should.be.exactly(1)
    list1.get(1).should.be.exactly(2)
    list1.get(2).should.be.exactly(2)
    list1.get(3).should.be.exactly(3)

    list1[0].should.be.exactly(1)
    list1[1].should.be.exactly(2)
    list1[2].should.be.exactly(2)
    list1[3].should.be.exactly(3)

    should(list1[4]).be.exactly(undefined)
    should(list1.get(4)).be.exactly(undefined)

    list1.get('0').should.be.exactly(1)
    list1.get('1').should.be.exactly(2)
    list1.get('2').should.be.exactly(2)
    list1.get('3').should.be.exactly(3)

    list1['0'].should.be.exactly(1)
    list1['1'].should.be.exactly(2)
    list1['2'].should.be.exactly(2)
    list1['3'].should.be.exactly(3)

    should(list1['4']).be.exactly(undefined)
    should(list1.get('4')).be.exactly(undefined)
  })

  it('includes()', () => {
    const list = p(M.List.of(1, 2, 3))

    list.includes(2).should.be.exactly(true)

    list.includes(4).should.be.exactly(false)

    list.includes(3, 3).should.be.exactly(false)

    list.includes(3, -1).should.be.exactly(true)

    p(M.List.of(1, 2, NaN)).includes(NaN).should.be.exactly(true)
  })

  it('join()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    list.join('-').should.be.exactly('1-2-2-3')
  })

  it('indexOf()', () => {
    const list = p(M.List.of(2, 9, 9))

    list.indexOf(2).should.be.exactly(0)

    list.indexOf(7).should.be.exactly(-1)

    list.indexOf(9, 2).should.be.exactly(2)

    list.indexOf(9).should.be.exactly(1)

    list.indexOf(2, -1).should.be.exactly(-1)

    list.indexOf(2, -3).should.be.exactly(0)
  })

  it('lastIndexOf()', () => {
    const list = p(M.List.of(2, 5, 9, 2))

    list.lastIndexOf(2).should.be.exactly(3)

    list.lastIndexOf(7).should.be.exactly(-1)

    list.lastIndexOf(2, 3).should.be.exactly(3)

    list.lastIndexOf(2, 2).should.be.exactly(0)

    list.lastIndexOf(2, -2).should.be.exactly(0)

    list.lastIndexOf(2, -1).should.be.exactly(3)
  })

  it('concat()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    list.concat(100).toJSON().should.eql([1, 2, 2, 3, 100])

    list.concat([100, 200]).toJSON().should.eql([1, 2, 2, 3, 100, 200])
  })

  it('slice()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    list.slice(1).toJSON().should.eql([2, 2, 3])

    list.slice(2).set(0, 100).toJSON().should.eql([100, 3])

    list.slice(2).toJSON().should.eql([2, 3])

    list.slice(-3).toJSON().should.eql([2, 2, 3])

    list.slice(0, -2).toJSON().should.eql([1, 2])
  })

  it('filter()', () => {
    const list = p(M.List.of(1, 2, 3))

    list.filter(x => x % 2 === 1).toJSON().should.eql([1, 3])
  })

  it('forEach()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    let sum = 0
    list.forEach(x => {
      sum += x
    })

    should(sum).be.exactly(8)
  })

  it('keys() / entries() / [@@iterator]()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    Array.from(list.entries()).should.eql([[0, 1], [1, 2], [2, 2], [3, 3]])

    Array.from(list.keys()).should.eql([0, 1, 2, 3])

    Array.from(list[Symbol.iterator]()).should.eql([1, 2, 2, 3])
  })

  it('every() / some()', () => {
    const list = p(M.List.of(1, 2, 3))

    list.every(x => x < 5).should.be.exactly(true)

    list.every(x => x < 3).should.be.exactly(false)

    list.some(x => x > 5).should.be.exactly(false)

    list.some(x => x < 3).should.be.exactly(true)
  })

  it('find() / findIndex()', () => {
    const list = p(M.List.of(2, 5, 9, 2))

    const multipleOf = x => n => n % x === 0

    list.find(multipleOf(3)).should.be.exactly(9)

    list.findIndex(multipleOf(3)).should.be.exactly(2)
  })

  it('reduce() / reduceRight()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    list.reduce((a, b) => a + b, 0).should.be.exactly(8)

    list.reduce((str, x) => str + x, '').should.be.exactly('1223')

    list.reduceRight((str, x) => str + x, '').should.be.exactly('3221')
  })

  it('reverse()', () => {
    const list = p(M.List.of(1, 2, 2, 3))

    list.reverse().toJSON().should.eql([3, 2, 2, 1])

    list.toJSON().should.eql([1, 2, 2, 3])
  })

  it('copyWithin()', () => {
    const list = p(M.List.of(1, 2, 3, 4, 5))

    list.copyWithin(-2).toJSON().should.eql([1, 2, 3, 1, 2])

    list.copyWithin(0, 3).toJSON().should.eql([4, 5, 3, 4, 5])

    list.copyWithin(0, 3, 4).toJSON().should.eql([4, 2, 3, 4, 5])

    list.copyWithin(-2, -3, -1).toJSON().should.eql([1, 2, 3, 3, 4])
  })

  it('fill()', () => {
    const list = p(M.List.of(1, 2, 3))

    list.fill(4).toJSON().should.eql([4, 4, 4])

    list.fill(4, 1, 2).toJSON().should.eql([1, 4, 3])

    list.fill(4, 1, 1).toJSON().should.eql([1, 2, 3])

    list.fill(4, -3, -2).toJSON().should.eql([4, 2, 3])

    list.fill(4, NaN, NaN).toJSON().should.eql([1, 2, 3])

    p(M.List.fromArray(Array(3))).fill(4).toJSON().should.eql([4, 4, 4])
  })

  it('sort()', () => {
    const list = p(M.List.of(1, 2, 5, 4, 3))

    Array.from(list.sort()).should.eql([1, 2, 3, 4, 5])

    Array.from(list.sort()).should.eql([1, 2, 3, 4, 5])
  })

  it('sort(fn)', () => {
    const list = p(M.List.of(1, 2, 5, 4, 3))

    const isEven = n => n % 2 === 0

    const evensBeforeOdds = (a, b) => {
      if (isEven(a)) {
        return isEven(b) ? a - b : -1
      }

      return isEven(b) ? 1 : a - b
    }

    list.sort(evensBeforeOdds).toJSON().should.eql([2, 4, 1, 3, 5])
  })

  it('map()', () => {
    const list = p(M.List.of(1, 2, 3))

    list.map(x => x + 10).should.eql([11, 12, 13])
  })
}
