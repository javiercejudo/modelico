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
      const asIsObject = JSON.parse('{"two":2}', AsIs(M.Any).reviver);

      should(asIsObject.two).be.exactly(2);
    });

    it('should support non-trivial native constructors: Function', () => {
      const asIsObject = JSON.parse('"return (function(x) { return x * 4 })(arguments[0])"', AsIs(Function).reviver);

      should(asIsObject(5)).be.exactly(20);
    });

    it('should support non-trivial native constructors: RegExp', () => {
      const asIsObject = JSON.parse('"^[a-z]+$"', AsIs(RegExp).reviver);

      asIsObject.test('abc').should.be.exactly(true);
      asIsObject.test('abc1').should.be.exactly(false);
      asIsObject.test('Abc').should.be.exactly(false);
    });

    it('should support any function', () => {
      const asIsObject = JSON.parse('9', AsIs(x => x * 2).reviver);

      should(asIsObject).be.exactly(18);
    });
  });

  describe('metadata', () => {
    it('should return metadata like type', () => {
      AsIs(String).type.should.be.exactly(String);

      const asIsObject = JSON.parse('{"two":2}', AsIs(M.Any).reviver);

      should(asIsObject.two).be.exactly(2);
    });

    U.skipIfNoObjectFreeze('should be immutable', () => {
      (() => AsIs().reviver = x => x).should.throw();
    });
  });
};
