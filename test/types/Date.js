'use strict';

import PersonFactory from './fixtures/Person';

export default (should, M) => () => {
  const Modelico = M.Modelico;

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Date('1988-04-16T00:00:00.000Z');
      const date = new M.Date(input);

      input.setFullYear(2017);

      should(date.inner().getFullYear())
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
      (() => new M.Date(null))
        .should.throw();
    });

    it('should set dates correctly', () => {
      const date1 = new M.Date(new Date('1988-04-16T00:00:00.000Z'));
      const date2 = date1.setPath([], new Date('1989-04-16T00:00:00.000Z'));
      const date3 = date1.set(new Date('1987-04-16T00:00:00.000Z'));

      should(date3.inner().getFullYear())
        .be.exactly(1987);

      should(date2.inner().getFullYear())
        .be.exactly(1989);

      should(date1.inner().getFullYear())
        .be.exactly(1988);
    });
  });

  describe('stringifying', () => {
    it('should stringify values correctly', () => {
      const date = new M.Date(new Date('1988-04-16T00:00:00.000Z'));

      JSON.stringify(date).should.be.exactly('"1988-04-16T00:00:00.000Z"');
    });
  });

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const date = JSON.parse('"1988-04-16T00:00:00.000Z"', M.Date.metadata().reviver);

      should(date.inner().getFullYear()).be.exactly(1988);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        M.Date.metadata(M.Date.metadata()).reviver
      )).should.throw();
    });
  });
};
