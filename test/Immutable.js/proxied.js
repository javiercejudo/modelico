'use strict';

export default (U, should, M) => () => {
  var objToArr = U.objToArr;
  var _m = M.proxyMap;
  var _l = M.proxyList;

  it('Getting started (proxied)', () => {
    var map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));
    var map2 = map1.set('b', 50);
    should(map1.get('b')).be.exactly(2);
    should(map2.get('b')).be.exactly(50);
  });

  it('The case for Immutability', () => {
    var map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));
    var map2 = map1.set('b', 2);
    map1.equals(map2).should.be.exactly(true);
    var map3 = map1.set('b', 50);
    map1.equals(map3).should.be.exactly(false);
  });

  it('JavaScript-first API', () => {
    var list1 = _l(M.List.fromArray([1, 2]));

    var list2 = list1.push(3, 4, 5);
    var list3 = list2.unshift(0);
    var list4 = list1.concat([...list2], [...list3]);

    (list1.length === 2).should.be.exactly(true);
    (list2.length === 5).should.be.exactly(true);
    (list3.length === 6).should.be.exactly(true);
    (list4.length === 13).should.be.exactly(true);
    (list4[0] === 1).should.be.exactly(true);
  });

  it('JavaScript-first API (2)', () => {
    var alpha = _m(M.Map.fromObject({a: 1, b: 2, c: 3, d: 4}));

    const res = [];
    alpha.forEach((v, k) => res.push(k.toUpperCase()));
    res.join().should.be.exactly('A,B,C,D');
  });

  it('Accepts raw JavaScript objects.', () => {
    var map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3, d: 4}));
    var map2 = _m(M.Map.fromObject({c: 10, a: 20, t: 30}));

    var obj = {d: 100, o: 200, g: 300};

    var map3 = M.Map.fromMap(
      new Map([].concat([...map1.entries()], [...map2.entries()], objToArr(obj)))
    );

    map3.equals(M.Map.fromObject({a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300}))
      .should.be.exactly(true);
  });

  it('Accepts raw JavaScript objects. (2)', () => {
    var map = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));

    const res = {};
    map.forEach((v, k) => res[k] = v * v);
    res.should.eql({a: 1, b: 4, c: 9});
  });

  it('Accepts raw JavaScript objects. (3)', () => {
    var obj = { 1: 'one' };
    Object.keys(obj)[0].should.be.exactly('1');
    obj['1'].should.be.exactly('one');
    obj[1].should.be.exactly('one');

    var map = _m(M.Map.fromObject(obj));
    map.get('1').should.be.exactly('one');
    should(map.get(1)).be.exactly(undefined);
  });

  it('Equality treats Collections as Data', () => {
    var map1 = _m(M.Map.fromObject({a: 1, b: 1, c: 1}));
    var map2 = _m(M.Map.fromObject({a: 1, b: 1, c: 1}));

    (map1 !== map2).should.be.exactly(true);   // two different instances
    map1.equals(map2).should.be.exactly(true); // have equivalent values
  });

  it('Batching Mutations', () => {
    var list1 = _l(M.List.fromArray([1, 2, 3]));

    var res = list1.innerList();
    res.push(4);
    res.push(5);
    res.push(6);
    var list2 = _l(M.List.fromArray(res));

    (list1.length === 3).should.be.exactly(true);
    (list2.length === 6).should.be.exactly(true);
  });
};
