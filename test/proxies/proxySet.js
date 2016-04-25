'use strict';

module.exports = (should, M) => () => {
  const p = M.proxySet;

  it('size', () => {
    const set = p(M.Set.fromArray([1, 2, 2, 3]));

    (set.size).should.be.exactly(3);
  });

  it('has() / add() / delete() / clear()', () => {
    const set1 = p(M.Set.fromArray([1, 2, 2, 3]));

    (set1.has(3)).should.be.exactly(true);
    (set1.has(50)).should.be.exactly(false);

    const set2 = set1.add(50);

    (set1.has(50)).should.be.exactly(false);
    (set2.has(50)).should.be.exactly(true);

    const set3 = set2.delete(50);

    (set2.has(50)).should.be.exactly(true);
    (set3.has(50)).should.be.exactly(false);

    const set4 = set1.clear();

    (set4.size).should.be.exactly(0);
  });

  it('entries()', () => {
    const set = p(M.Set.fromArray([1, 2, 2, 3]));

    Array.from(set.entries())
      .should.eql([[1, 1], [2, 2], [3, 3]]);
  });

  it('values() / keys() / [@@iterator]()', () => {
    const set = p(M.Set.fromArray([1, 2, 2, 3]));

    Array.from(set.values())
      .should.eql([1, 2, 3]);

    Array.from(set.keys())
      .should.eql([1, 2, 3]);

    Array.from(set[Symbol.iterator]())
      .should.eql([1, 2, 3]);
  });

  it('forEach()', () => {
    const set = p(M.Set.fromArray([1, 2, 2, 3]));

    let sum = 0;
    set.forEach(x => sum += x);

    (sum).should.be.exactly(6);
  });
};
