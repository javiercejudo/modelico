'use strict';

module.exports = (should, M) => () => {
  const AsIs = M.AsIs;

  describe('constructor', () => {
    it('should create a simple wrapper for the value', () => {
      const asIsNumber = new AsIs(Number, 1);
      const asIsObject = new AsIs(Object, {two: 2});

      should(asIsNumber.value()).be.exactly(1);
      asIsObject.value().should.eql({two: 2});
    });

    it('should be immutable', () => {
      const asIsObject = new AsIs(Object, {two: 2});

      (_ => AsIs.newStaticFn = () => {}).should.throw();
      (_ => asIsObject.value = 3).should.throw();

      asIsObject.value().two = 3;
      should(asIsObject.value().two).be.exactly(2);
    });
  });

  describe('toJSON', () => {
    it('should stringify the value as is', () => {
      const asIsNumber = new AsIs(Number, 1);
      const asIsObject = new AsIs(Object, {two: 2});

      JSON.stringify(asIsNumber).should.be.exactly('1');
      JSON.stringify(asIsObject).should.be.exactly('{"two":2}');
    });
  });

  describe('reviver', () => {
    it('should revive the value as is, without the wrapper', () => {
      const asIsObject = JSON.parse('{"two":2}', AsIs.buildReviver(Object));

      should(asIsObject.two).be.exactly(2);
    });
  });

  describe('metadata', () => {
    it('should return metadata like type', () => {
      AsIs.metadata(String).type.should.be.exactly(String);

      const asIsObject = JSON.parse('{"two":2}', AsIs.metadata(Object).reviver);
    });

    it('should be immutable', () => {
      (_ => AsIs.metadata = {}).should.throw();
    });
  });
};
