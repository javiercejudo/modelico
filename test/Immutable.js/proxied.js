'use strict';

export default (U, should, M) => () => {
  const _m = M.proxyMap;
  const _l = M.proxyList;

  const objToArr = U.objToArr;

  it('Getting started (proxied)', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));
    const map2 = map1.set('b', 50);
    should(map1.get('b')).be.exactly(2);
    should(map2.get('b')).be.exactly(50);
  });

  it('The case for Immutability', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));
    const map2 = map1.set('b', 2);
    map1.equals(map2).should.be.exactly(true);
    const map3 = map1.set('b', 50);
    map1.equals(map3).should.be.exactly(false);
  });

  it('JavaScript-first API', () => {
    const list1 = _l(M.List.fromArray([1, 2]));

    const list2 = list1.push(3, 4, 5);
    const list3 = list2.unshift(0);
    const list4 = list1.concat([...list2], [...list3]);

    (list1.length === 2).should.be.exactly(true);
    (list2.length === 5).should.be.exactly(true);
    (list3.length === 6).should.be.exactly(true);
    (list4.length === 13).should.be.exactly(true);
    (list4[0] === 1).should.be.exactly(true);
  });

  it('JavaScript-first API (2)', () => {
    const alpha = _m(M.Map.fromObject({a: 1, b: 2, c: 3, d: 4}));

    const res = [];
    alpha.forEach((v, k) => res.push(k.toUpperCase()));
    res.join().should.be.exactly('A,B,C,D');
  });

  it('Accepts raw JavaScript objects.', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3, d: 4}));
    const map2 = _m(M.Map.fromObject({c: 10, a: 20, t: 30}));

    const obj = {d: 100, o: 200, g: 300};

    const map3 = M.Map.fromMap(
      new Map([].concat([...map1.entries()], [...map2.entries()], objToArr(obj)))
    );

    map3.equals(M.Map.fromObject({a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300}))
      .should.be.exactly(true);
  });

  it('Accepts raw JavaScript objects. (2)', () => {
    const map = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));

    const res = {};
    map.forEach((v, k) => res[k] = v * v);
    res.should.eql({a: 1, b: 4, c: 9});
  });

  it('Accepts raw JavaScript objects. (3)', () => {
    const obj = { 1: 'one' };
    Object.keys(obj)[0].should.be.exactly('1');
    obj['1'].should.be.exactly('one');
    obj[1].should.be.exactly('one');

    const map = _m(M.Map.fromObject(obj));
    map.get('1').should.be.exactly('one');
    should(map.get(1)).be.exactly(undefined);
  });

  it('Equality treats Collections as Data', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 1, c: 1}));
    const map2 = _m(M.Map.fromObject({a: 1, b: 1, c: 1}));

    (map1 !== map2).should.be.exactly(true);   // two different instances
    map1.equals(map2).should.be.exactly(true); // have equivalent values
  });

  it('Batching Mutations', () => {
    const list1 = _l(M.List.fromArray([1, 2, 3]));

    const res = list1.inner();
    res.push(4);
    res.push(5);
    res.push(6);
    const list2 = _l(M.List.fromArray(res));

    (list1.length === 3).should.be.exactly(true);
    (list2.length === 6).should.be.exactly(true);
  });
};
