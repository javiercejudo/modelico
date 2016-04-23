'use strict';

module.exports = (should, M) => () => {
  const p = M.proxyList;

  it('length', () => {
    const list1 = p(M.List.fromArray([1, 2, 2, 3]));

    (list1.length).should.be.exactly(4);
  });

  it('[n]', () => {
    const list1 = p(M.List.fromArray([1, 2, 2, 3]));

    (list1[0]).should.be.exactly(1);
    (list1[1]).should.be.exactly(2);
    (list1[2]).should.be.exactly(2);
    (list1[3]).should.be.exactly(3);

    should(list1[4]).be.exactly(undefined);

    (list1['0']).should.be.exactly(1);
    (list1['1']).should.be.exactly(2);
    (list1['2']).should.be.exactly(2);
    (list1['3']).should.be.exactly(3);

    should(list1['4']).be.exactly(undefined);
  });

  it('reduce()', () => {
    const list = p(M.List.fromArray([1, 2, 2, 3]));

    list.reduce((a, b) => a + b, 0)
      .should.be.exactly(8);
  });

  it('join()', () => {
    const list = p(M.List.fromArray([1, 2, 2, 3]));

    list.join('-')
      .should.be.exactly('1-2-2-3');
  });

  it('reverse()', () => {
    const list = p(M.List.fromArray([1, 2, 2, 3]));

    list.reverse().toJSON()
      .should.eql([3, 2, 2, 1]);

    list.toJSON()
      .should.eql([1, 2, 2, 3]);
  });

  it('slice()', () => {
    const list = p(M.List.fromArray([1, 2, 2, 3]));

    list.slice(1).toJSON()
      .should.eql([2, 2, 3]);

    list.slice(2).set(0, 100).toJSON()
      .should.eql([100, 3]);

    list.slice(2).toJSON()
      .should.eql([2, 3]);

    list.slice(-3).toJSON()
      .should.eql([2, 2, 3]);

    list.slice(0, -2).toJSON()
      .should.eql([1, 2]);
  });

  it('concat()', () => {
    const list = p(M.List.fromArray([1, 2, 2, 3]));

    list.concat(100).toJSON()
      .should.eql([1, 2, 2, 3, 100]);

    list.concat([100, 200]).toJSON()
      .should.eql([1, 2, 2, 3, 100, 200]);
  });

  it('copyWithin()', () => {
    const list = p(M.List.fromArray([1, 2, 3, 4, 5]));

    list.copyWithin(-2).toJSON()
      .should.eql([1, 2, 3, 1, 2]);

    list.copyWithin(0, 3).toJSON()
      .should.eql([4, 5, 3, 4, 5]);

    list.copyWithin(0, 3, 4).toJSON()
      .should.eql([4, 2, 3, 4, 5]);

    list.copyWithin(-2, -3, -1).toJSON()
      .should.eql([1, 2, 3, 3, 4]);
  });

  it('fill()', () => {
    const list = p(M.List.fromArray([1, 2, 3]));

    list.fill(4).toJSON()
      .should.eql([4, 4, 4]);

    list.fill(4, 1, 2).toJSON()
      .should.eql([1, 4, 3]);

    list.fill(4, 1, 1).toJSON()
      .should.eql([1, 2, 3]);

    list.fill(4, -3, -2).toJSON()
      .should.eql([4, 2, 3]);

    list.fill(4, NaN, NaN).toJSON()
      .should.eql([1, 2, 3]);

    p(M.List.fromArray(Array(3))).fill(4).toJSON()
      .should.eql([4, 4, 4]);
  });

  it('filter()', () => {
    const list = p(M.List.fromArray([1, 2, 3]));

    list.filter(x => (x % 2 === 1)).toJSON()
      .should.eql([1, 3]);
  });

  it('map()', () => {
    const list = p(M.List.fromArray([1, 2, 3]));

    list.map(x => x + 10)
      .should.eql([11, 12, 13]);
  });
};
