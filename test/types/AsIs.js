'use strict';

export default (U, should, M) => () => {
  const AsIs = M.AsIs;
  const List = M.List;

  describe('toJSON', () => {
    it('should stringify the value as is', () => {
      const mapOfNumbers = M.Map.of('a', 1, 'b', 2);

      JSON.stringify(mapOfNumbers)
        .should.be.exactly('[["a",1],["b",2]]');
    });
  });

  describe('reviver', () => {
    it('should revive the value as is, without the wrapper', () => {
      const asIsObject = JSON.parse('{"two":2}', AsIs(Object).reviver);

      should(asIsObject.two).be.exactly(2);
    });
  });

  describe('metadata', () => {
    it('should return metadata like type', () => {
      AsIs(String).type.should.be.exactly(String);

      const asIsObject = JSON.parse('{"two":2}', AsIs(Object).reviver);

      should(asIsObject.two).be.exactly(2);
    });

    U.skipIfNoObjectFreeze('should be immutable', () => {
      (() => AsIs().reviver = x => x).should.throw();
    });
  });
};
