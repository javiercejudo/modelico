'use strict';

export default (should, M) => () => {
  var p = M.proxyMap;

  it('size', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

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

  it('entries()', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    Array.from(map.entries())
      .should.eql([['a', 1], ['b', 2], ['c', 3]]);
  });

  it('values() / keys() / [@@iterator]()', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    Array.from(map.values())
      .should.eql([1, 2, 3]);

    Array.from(map.keys())
      .should.eql(['a', 'b', 'c']);

    Array.from(map[Symbol.iterator]())
      .should.eql([['a', 1], ['b', 2], ['c', 3]]);
  });

  it('forEach()', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    let sum = 0;
    let keys = '';

    map.forEach((v, k) => {
      sum += v;
      keys += k.toUpperCase();
    });

    (sum).should.be.exactly(6);
    (keys).should.be.exactly('ABC');
  });
};
