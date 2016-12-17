'use strict';

export default (should, M) => () => {
  const { date } = M.metadata;

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Date('1988-04-16T00:00:00.000Z');
      const myDate = M.Date.of(input);

      input.setFullYear(2017);

      should(myDate.inner().getFullYear())
        .be.exactly(1988);
    });
  });

  describe('instantiation', () => {
    it('must be instantiated with new', () => {
      (() => M.Date(new Date())).should.throw();
    });
  });

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      (() => M.Date.of(null))
        .should.throw();
    });

    it('should set dates correctly', () => {
      const date1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));
      const date2 = date1.setPath([], new Date('1989-04-16T00:00:00.000Z'));

      should(date2.inner().getFullYear())
        .be.exactly(1989);

      should(date1.inner().getFullYear())
        .be.exactly(1988);
    });

    it('should not support the set operation', () => {
      const myDate = M.Date.of(new Date());

      (() => myDate.set())
        .should.throw();
    });

    it('should not support the setPath operation with non-empty paths', () => {
      const myDate = M.Date.of(new Date());

      (() => myDate.setPath([0], new Date()))
        .should.throw();
    });
  });

  describe('stringifying', () => {
    it('should stringify values correctly', () => {
      const myDate = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));

      JSON.stringify(myDate).should.be.exactly('"1988-04-16T00:00:00.000Z"');
    });
  });

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const myDate = JSON.parse('"1988-04-16T00:00:00.000Z"', date().reviver);

      should(myDate.inner().getFullYear()).be.exactly(1988);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        date().reviver
      )).should.throw();
    });
  });
};
