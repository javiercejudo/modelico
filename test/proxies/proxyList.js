'use strict';

module.exports = (should, M) => () => {
  const p = M.proxyList;

  it('should make Array methods available to Modelico List', () => {
    const list = p(M.List.fromArray([1, 2, 2, 3]));
    const add = (a, b) => a + b;

    list.reduce(add, 0)
      .should.be.exactly(8);

    list.join('-')
      .should.be.exactly('1-2-2-3');
  });

  it('should make Array properties available to Modelico List', () => {
    const list1 = p(M.List.fromArray([1, 2, 2, 3]));
    const list2 = p(list1.set(1, 50));

    list1[1].should.be.exactly(2);
    list2[1].should.be.exactly(50);

    (list1.length).should.be.exactly(4);
  });
};
