'use strict';

module.exports = (should, M) => () => {
  var p = M.proxyMap;

  it('size', () => {
    var map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    (map.size).should.be.exactly(3);
  });

  it('get() / set() / delete() / clear()', () => {
    const map1 = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    const map2 = map1.set('b', 50);

    (map1.get('b')).should.be.exactly(2);
    (map2.get('b')).should.be.exactly(50);

    const map3 = map2.delete('c');

    (map2.get('c')).should.be.exactly(3);
    (map3.has('c')).should.be.exactly(false);

    const map4 = map3.clear();

    (map3.size).should.be.exactly(2);
    (map4.size).should.be.exactly(0);
  });
};
