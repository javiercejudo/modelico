'use strict';

module.exports = (should, M) => () => {
  const AsIs = M.AsIs;
  const List = M.List;

  describe('constructor', () => {
    it('should create a simple wrapper for the value', () => {
      const asIsNumber = new AsIs(Number, 1);
      const asIsObject = new AsIs(Object, {two: 2});

      should(asIsNumber.value()).be.exactly(1);
      asIsObject.value().should.eql({two: 2});
    });

    it('should be immutable', () => {
      const asIsObject = new AsIs(Object, {two: 2});

      (() => AsIs.newStaticFn = () => {}).should.throw();
      (() => asIsObject.value = 3).should.throw();

      asIsObject.value().two = 3;
      should(asIsObject.value().two).be.exactly(2);
    });
  });

  describe('setting', () => {
    it('should set the entity correctly', () => {
      const asIsNumber = new AsIs(Number, 1);
      const asIsNumber2 = asIsNumber.set(2);

      should(asIsNumber2.value()).be.exactly(2);

      // verify that asIsNumber was not mutated
      should(asIsNumber.value()).be.exactly(1);
    });

    it('should set the entity correctly when part of a path', () => {
      const list = [new AsIs(String, 'a'), new AsIs(String, 'b')];

      const modelicoList1 = new List(AsIs.metadata(String), list);
      const modelicoList2 = modelicoList1.setPath([1], new AsIs(String, 'B'));
      const modelicoList3 = modelicoList2.setPath([1, 'value'], 'bb');

      modelicoList2.list()[1].value()
        .should.be.exactly('B');

      modelicoList3.list()[1].value()
        .should.be.exactly('bb');

      // verify that modelicoList1 was not mutated
      modelicoList1.list()[1].value()
        .should.be.exactly('b');
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
      const asIsObject = JSON.parse('{"two":2}', AsIs.metadata(Object).reviver);

      should(asIsObject.two).be.exactly(2);
    });
  });

  describe('metadata', () => {
    it('should return metadata like type', () => {
      AsIs.metadata(String).type.should.be.exactly(String);

      const asIsObject = JSON.parse('{"two":2}', AsIs.metadata(Object).reviver);

      should(asIsObject.two).be.exactly(2);
    });

    it('should be immutable', () => {
      (() => AsIs.metadata = {}).should.throw();
    });
  });
};
