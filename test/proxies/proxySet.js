'use strict';

module.exports = (should, M) => () => {
  const p = M.proxySet;

  it('should make Set methods available to Modelico Set', () => {
    const set = p(M.Set.fromArray([1, 2, 2, 3]));

    Array.from(set.values()).reduce((a, b) => a + b, 0)
      .should.be.exactly(6);

    (set.size).should.be.exactly(3);

    p(M.Set.fromSet(set.add(5))).size
      .should.be.exactly(4);
  });

  it('should make Set properties available to Modelico Set', () => {
    const set1 = p(M.Set.fromArray([1, 2, 2, 3]));
    const set2 = p(set1.set(1, 50));

    (set1.size).should.be.exactly(3);
    (set2.size).should.be.exactly(3);

    set1.has(2).should.be.exactly(true);
    set2.has(2).should.be.exactly(false);
  });
};
