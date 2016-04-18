'use strict';

module.exports = (U, should, M) => () => {
  var objToArr = U.objToArr;

  it('Getting started', () => {
    var map1 = M.Map.fromObject({a: 1, b: 2, c: 3});
    var map2 = map1.set('b', 50);
    should(map1.innerMap().get('b')).be.exactly(2);
    should(map2.innerMap().get('b')).be.exactly(50);
  });

  it('The case for Immutability', () => {
    var map1 = M.Map.fromObject({a: 1, b: 2, c: 3});
    var map2 = map1.set('b', 2);
    map1.equals(map2).should.be.exactly(true);
    var map3 = map1.set('b', 50);
    map1.equals(map3).should.be.exactly(false);
  });

  it('JavaScript-first API', () => {
    var list1 = M.List.fromArray([1, 2]);

    var list2Array = list1.innerList();
    list2Array.push(3, 4, 5);
    var list2 = M.List.fromArray(list2Array);

    var list3Array = list2.innerList();
    list3Array.unshift(0);
    var list3 = M.List.fromArray(list3Array);

    var list4Array = list1.innerList();
    var list4 = M.List.fromArray(list1.innerList().concat(list2.innerList(), list3.innerList()));

    (list1.innerList().length === 2).should.be.exactly(true);
    (list2.innerList().length === 5).should.be.exactly(true);
    (list3.innerList().length === 6).should.be.exactly(true);
    (list4.innerList().length === 13).should.be.exactly(true);
    (list4.innerList()[0] === 1).should.be.exactly(true);
  });

  it('JavaScript-first API (2)', () => {
    var alpha = M.Map.fromObject({a: 1, b: 2, c: 3, d: 4});
    Array.from(alpha.innerMap()).map(kv =>  kv[0].toUpperCase()).join()
      .should.be.exactly('A,B,C,D');
  });

  it('Accepts raw JavaScript objects.', () => {
    var map1 = M.Map.fromObject({a: 1, b: 2, c: 3, d: 4});
    var map2 = M.Map.fromObject({c: 10, a: 20, t: 30});

    var obj = {d: 100, o: 200, g: 300};

    var map3 = M.Map.fromMap(
      new Map(Array.from(map1.innerMap()).concat(Array.from(map2.innerMap()), objToArr(obj)))
    );

    map3.equals(M.Map.fromObject({a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300}))
      .should.be.exactly(true);
  });

  it('Accepts raw JavaScript objects. (2)', () => {
    var myObject = {a: 1, b: 2, c: 3};

    objToArr(myObject).reduce((acc, kv) => {
      acc[kv[0]] = Math.pow(kv[1], 2);
      return acc;
    }, {}).should.eql({a: 1, b: 4, c: 9});
  });

  it('Accepts raw JavaScript objects. (3)', () => {
    var obj = { 1: "one" };
    Object.keys(obj)[0].should.be.exactly('1');
    obj["1"].should.be.exactly('one');
    obj[1].should.be.exactly('one');

    var map = M.Map.fromObject(obj);
    map.innerMap().get('1').should.be.exactly('one');
    should(map.innerMap().get(1)).be.exactly(undefined);
  });

  it('Equality treats Collections as Data', () => {
    var map1 = M.Map.fromObject({a: 1, b: 1, c: 1});
    var map2 = M.Map.fromObject({a: 1, b: 1, c: 1});

    (map1 !== map2).should.be.exactly(true); // two different instances
    map1.equals(map2).should.be.exactly(true); // have equivalent values
  });

  it('Batching Mutations', () => {
    var list1 = M.List.fromArray([1, 2, 3]);
    var list2Array = list1.innerList();
    list2Array.push(4, 5, 6);
    var list2 = M.List.fromArray(list2Array);

    (list1.innerList().length === 3).should.be.exactly(true);
    (list2.innerList().length === 6).should.be.exactly(true);
  });
};
