'use strict';

export default (should, M) => () => {

  it('should work across types', () => {
    const hammer = M.Map.fromObject({hammer: 'Can’t Touch This'});
    const array1 = M.List.fromArray(['totally', 'immutable', hammer]);

    array1.inner()[1] = 'I’m going to mutate you!';
    (array1.inner()[1]).should.be.exactly('immutable');

    array1.setPath([2, 'hammer'], 'hm, surely I can mutate this nested object...');

    array1.inner()[2].inner().get('hammer')
      .should.be.exactly('Can’t Touch This');
  });

  it('should work across types (2)', () => {
    const list = M.List.fromArray(['totally', 'immutable']);
    const hammer1 = M.Map.fromObject({hammer: 'Can’t Touch This', list});

    hammer1.inner().set('hammer', 'I’m going to mutate you!');
    hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

    hammer1.setPath(['list', 1], 'hm, surely I can mutate this nested object...');

    (hammer1.inner().get('list').inner()[1])
      .should.be.exactly('immutable');
  });

  it('should work across types (3)', () => {
    const mySet = M.Set.fromArray(['totally', 'immutable']);
    const hammer1 = M.Map.fromObject({hammer: 'Can’t Touch This', mySet});

    hammer1.inner().set('hammer', 'I’m going to mutate you!');
    hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

    hammer1.setPath(['mySet', 1], 'hm, surely I can mutate this nested object...');

    (hammer1.inner().get('mySet').inner().has('immutable'))
      .should.be.exactly(true);
  });
};
