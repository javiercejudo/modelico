'use strict';

module.exports = (should, M) => () => {
  var p = M.proxyMap;

  it('should make Map methods available to Modelico Map', () => {
    var map1 = p(M.Map.fromObject({a: 1, b: 2, c: 3}));
    var map2 = p(map1.set('b', 50));

    should(map1.get('b')).be.exactly(2);
    should(map2.get('b')).be.exactly(50);
  });

  it('should make Map properties available to Modelico Map', () => {
    var map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    should(map.size).be.exactly(3);
  });
};
