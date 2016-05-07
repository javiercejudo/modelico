(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.modelicoSpec = factory());
}(this, function () { 'use strict';

  const range = (minTime, maxTime) => ({minTime, maxTime});

  var PartOfDayFactory = M => {
    return new M.Enum({
      ANY: range(0, 1440),
      MORNING: range(0, 720),
      AFTERNOON: range(720, 1080),
      EVENING: range(1080, 1440)
    });
  };

  var SexFactory = M => {
    return new M.Enum(['FEMALE', 'MALE', 'OTHER']);
  };

  var PersonFactory = M => {
    const PartOfDay = PartOfDayFactory(M).metadata;
    const Sex = SexFactory(M).metadata;

    const Modelico = M.Modelico;

    const ModelicoMap = M.Map.metadata;
    const ModelicoList = M.List.metadata;
    const ModelicoSet = M.Set.metadata;
    const ModelicoDate = M.Date.metadata;

    const joinWithSpace = arr => arr.filter(x => x !== null && x !== undefined).join(' ');

    class Person extends Modelico {
      constructor(fields) {
        super(Person, fields);

        Object.freeze(this);
      }

      fullName() {
        return joinWithSpace([this.givenName(), this.familyName()]);
      }

      static innerTypes() {
        return Object.freeze({
          'birthday': ModelicoDate(),
          'favouritePartOfDay': PartOfDay(),
          'lifeEvents': ModelicoMap(String, ModelicoDate()),
          'importantDatesList': ModelicoList(ModelicoDate()),
          'importantDatesSet': ModelicoSet(ModelicoDate()),
          'sex': Sex()
        });
      }

      static metadata() {
        return Modelico.metadata(Person);
      }
    }

    return Object.freeze(Person);
  };

  var AnimalFactory = M => {
    const Modelico = M.Modelico;

    class Animal extends Modelico {
      constructor(fields) {
        super(Animal, fields);
      }

      speak() {
        return 'hello';
      }
    }

    return Object.freeze(Animal);
  };

  var Modelico = (should, M) => () => {
    const Person = PersonFactory(M);
    const PartOfDay = PartOfDayFactory(M);
    const Sex = SexFactory(M);
    const Animal = AnimalFactory(M);

    const Modelico = M.Modelico;
    const ModelicoDate = M.Date;

    const author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","sex":"MALE"}';
    const author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

    describe('setting', () => {
      it('should set fields returning a new object', () => {
        const author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        // sanity check
        JSON.stringify(author1)
          .should.be.exactly(author1Json);

        author1.givenName().should.be.exactly('Javier');

        // field setting
        const author2 = author1.set('givenName', 'Javi');

        // repeat sanity check
        author1.givenName().should.be.exactly('Javier');

        JSON.stringify(author1)
          .should.be.exactly(author1Json);

        // new object checks
        (author2 === author1).should.be.exactly(false);
        author2.givenName().should.be.exactly('Javi');
        author2.equals(author1).should.be.exactly(false, 'Oops, they are equal');
      });

      it('should set fields recursively returning a new object', () => {
        const author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        const author2 = author1.setPath(['givenName'], 'Javi')
          .setPath(['birthday', 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(author2.birthday().date().getFullYear())
          .be.exactly(1989);

        // verify that the original author1 was not mutated
        should(author1.birthday().date().getFullYear())
          .be.exactly(1988);
      });

      it('edge case when Modelico setPath is called with an empty path', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        const author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);
        const listOfPeople1 = new M.List(Person.metadata(), [author]);

        const listOfPeople2 = listOfPeople1.setPath([0, 'givenName'], 'Javi');
        const listOfPeople3 = listOfPeople2.setPath([0], author.fields());

        listOfPeople1.innerList()[0].givenName().should.be.exactly('Javier');
        listOfPeople2.innerList()[0].givenName().should.be.exactly('Javi');
        listOfPeople3.innerList()[0].givenName().should.be.exactly('Javier');
      });
    });

    describe('stringifying', () => {
      it('should stringify types correctly', () => {
        const author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        JSON.stringify(author1)
          .should.be.exactly(author1Json);
      });

      it('should support null in Enum', () => {
        const author2 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: null,
          sex: Sex.MALE()
        });

        JSON.stringify(author2)
          .should.be.exactly(author2Json);
      });
    });

    describe('parsing', () => {
      it('should parse types correctly', () => {
        const author1 = Modelico.fromJSON(Person, author1Json);
        const author2 = JSON.parse(author1Json, Modelico.metadata(Person).reviver);

        'Javier Cejudo'
          .should.be.exactly(author1.fullName())
          .and.exactly(author2.fullName());

        should(1988)
          .be.exactly(author1.birthday().date().getFullYear())
          .and.exactly(author2.birthday().date().getFullYear());

        should(PartOfDay.EVENING().minTime)
          .be.exactly(author1.favouritePartOfDay().minTime)
          .and.exactly(author2.favouritePartOfDay().minTime);

        (Sex.MALE().code)
          .should.be.exactly(author1.sex().code)
          .and.exactly(author2.sex().code);
      });

      it('should support null in Enum', () => {
        const author2 = Modelico.fromJSON(Person, author2Json);

        (author2.favouritePartOfDay() === null).should.be.exactly(true);
      });

      it('should work with plain classes extending Modelico', () => {
        const animal = JSON.parse('{"name": "Sam"}', Modelico.metadata(Animal).reviver);

        animal.speak().should.be.exactly('hello');
        animal.name().should.be.exactly('Sam');
      });
    });

    describe('comparing', () => {
      it('should identify equal instances', () => {
        const author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        const author2 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        const author3 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo Goñi',
          birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        author1.equals(author2).should.be.exactly(true);
        author1.equals(author3).should.be.exactly(false);

        author1.should.not.be.exactly(author2);
      });
    });
  };

  var ModelicoAsIs = (U, should, M) => () => {
    const AsIs = M.AsIs;
    const List = M.List;

    describe('toJSON', () => {
      it('should stringify the value as is', () => {
        const mapOfNumbers = M.Map.fromObject({a: 1, b: 2});

        JSON.stringify(mapOfNumbers)
          .should.be.exactly('[{"key":"a","value":1},{"key":"b","value":2}]');
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

  var ModelicoMap = (should, M) => () => {
    const Person = PersonFactory(M);

    const Modelico = M.Modelico;
    const ModelicoAsIs = M.AsIs;
    const ModelicoMap = M.Map;
    const ModelicoDate = M.Date;

    describe('setting', () => {
      it('should implement Symbol.iterator', () => {
        const map = M.Map.fromObject({a: 1, b: 2, c: 3});

        Array.from(map)
          .should.eql([['a', 1], ['b', 2], ['c', 3]]);
      });

      it('should set fields returning a new map', () => {
        const map = new Map([
          ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
          ['b', new ModelicoDate(null)]
        ]);

        const modelicoMap1 = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), map);
        const modelicoMap2 = modelicoMap1.set('a', new ModelicoDate(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoMap2.innerMap().get('a').date().getFullYear())
          .be.exactly(1989);

        // verify that modelicoMap1 was not mutated
        should(modelicoMap1.innerMap().get('a').date().getFullYear())
          .be.exactly(1988);
      });

      it('should set fields returning a new map when part of a path', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        const author1 = Modelico.fromJSON(Person, authorJson);
        const author2 = author1.setPath(['lifeEvents', 'wedding', 'date'], new Date('2013-03-28T00:00:00.000Z'));

        should(author2.lifeEvents().innerMap().get('wedding').date().getFullYear())
          .be.exactly(2013);

        // verify that author1 was not mutated
        should(author1.lifeEvents().innerMap().get('wedding').date().getFullYear())
          .be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        const author = Modelico.fromJSON(Person, authorJson);

        const map = author.lifeEvents();

        should(map.innerMap().get('wedding').date().getFullYear())
          .be.exactly(2012);

        const customMap = new Map([
          ['wedding', new ModelicoDate(new Date('2013-03-28T00:00:00.000Z'))]
        ]);

        const map2 = map.setPath([], customMap);

        should(map2.innerMap().get('wedding').date().getFullYear())
          .be.exactly(2013);
      });
    });

    describe('stringifying', () => {
      it('should stringify the map correctly', () => {
        const map = new Map([
          ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
          ['b', new ModelicoDate(null)]
        ]);

        const modelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), map);

        JSON.stringify(modelicoMap)
          .should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
      });

      it('should support null maps', () => {
        const map = null;
        const modelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), map);

        JSON.stringify(modelicoMap)
          .should.be.exactly('null');
      });
    });

    describe('parsing', () => {
      it('should parse the map correctly', () => {
        const modelicoMap = JSON.parse(
          '[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]',
          ModelicoMap.metadata(ModelicoAsIs(String), ModelicoDate.metadata()).reviver
        );

        should(modelicoMap.innerMap().get('a').date().getFullYear())
          .be.exactly(1988);

        should(modelicoMap.innerMap().get('b').date())
          .be.exactly(null);
      });

      it('should be parsed correctly when used within another class', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        const author = Modelico.fromJSON(Person, authorJson);

        should(author.lifeEvents().innerMap().get('wedding').date().getFullYear()).be.exactly(2013);
      });

      it('should support null maps', () => {
        const modelicoMap = JSON.parse(
          'null',
          ModelicoMap.metadata(ModelicoAsIs(String), ModelicoDate.metadata()).reviver
        );

        should(modelicoMap.innerMap())
          .be.exactly(null);
      });
    });

    describe('comparing', () => {
      it('should identify equal instances', () => {
        const modelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), new Map([
          ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
        ]));

        const modelicoMap2 = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), new Map([
          ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
        ]));

        modelicoMap.should.not.be.exactly(modelicoMap2);
        modelicoMap.should.not.equal(modelicoMap2);

        modelicoMap.equals(modelicoMap2).should.be.exactly(true);
      });
    });

    describe('from object', () => {
      it('should be able to create a set from an array', () => {
        var map1 = M.Map.fromObject({a: 1, b: 2, c: 3});

        should(map1.innerMap().get('b')).be.exactly(2);
      });
    });

    describe('from map', () => {
      it('should be able to create a set from a native set', () => {
        var map1 = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

        should(map1.innerMap().get('b')).be.exactly(2);
      });
    });
  };

  var ModelicoEnumMap = (should, M) => () => {
    const PartOfDay = PartOfDayFactory(M);

    describe('setting', () => {
      it('should set fields returning a new enum map', () => {
        const map = new Map([
          [PartOfDay.MORNING(), 'Good morning!'],
          [PartOfDay.AFTERNOON(), 'Good afternoon!'],
          [PartOfDay.EVENING(), 'Good evening!']
        ]);

        const greetings1 = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);
        const greetings2 = greetings1.set(PartOfDay.AFTERNOON(), 'GOOD AFTERNOON!');

        greetings2.innerMap().get(PartOfDay.AFTERNOON())
          .should.be.exactly('GOOD AFTERNOON!');

        greetings1.innerMap().get(PartOfDay.AFTERNOON())
          .should.be.exactly('Good afternoon!');
      });

      it('should set fields returning a new enum map when part of a path', () => {
        const map = new Map([
          [PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))],
          [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))],
          [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]
        ]);

        const greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map);
        const greetings2 = greetings1.setPath([PartOfDay.EVENING(), 'date'], new Date('2013-04-16T00:00:00.000Z'));

        should(greetings2.innerMap().get(PartOfDay.EVENING()).date().getFullYear())
          .be.exactly(2013);

        should(greetings1.innerMap().get(PartOfDay.EVENING()).date().getFullYear())
          .be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', () => {
        const map1 = new Map([
          [PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))],
          [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))],
          [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]
        ]);

        const map2 = new Map([
          [PartOfDay.MORNING(), new M.Date(new Date('1989-04-16T00:00:00.000Z'))],
          [PartOfDay.AFTERNOON(), new M.Date(new Date('2001-04-16T00:00:00.000Z'))],
          [PartOfDay.EVENING(), new M.Date(new Date('2013-04-16T00:00:00.000Z'))]
        ]);

        const greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map1);
        const greetings2 = greetings1.setPath([], map2);

        should(greetings2.innerMap().get(PartOfDay.EVENING()).date().getFullYear())
          .be.exactly(2013);

        should(greetings1.innerMap().get(PartOfDay.EVENING()).date().getFullYear())
          .be.exactly(2012);
      });
    });

    describe('stringifying', () => {
      it('should stringify the enum map correctly', () => {
        const map = new Map([
          [PartOfDay.MORNING(), 'Good morning!'],
          [PartOfDay.AFTERNOON(), 'Good afternoon!'],
          [PartOfDay.EVENING(), 'Good evening!']
        ]);

        const greetings = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);

        JSON.stringify(greetings)
          .should.be.exactly('{"MORNING":"Good morning!","AFTERNOON":"Good afternoon!","EVENING":"Good evening!"}');
      });

      it('should support null enum maps', () => {
        const map = null;

        const greetings = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);

        JSON.stringify(greetings)
          .should.be.exactly('null');
      });
    });

    describe('parsing', () => {
      it('should parse the enum map correctly', () => {
        const greetings = JSON.parse(
          '{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":[]}',
          M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(M.Any)).reviver
        );

        greetings.innerMap().get(PartOfDay.MORNING())
          .should.be.exactly('Good morning!');
      });

      it('should support null enum maps', () => {
        const greetings = JSON.parse(
          'null',
          M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(String)).reviver
        );

        should(greetings.innerMap()).be.exactly(null);
      });
    });
  };

  var ModelicoList = (should, M) => () => {
    const Person = PersonFactory(M);

    const Modelico = M.Modelico;

    describe('instantiation', () => {
      it('must be instantiated with new', () => {
        (() => M.List(M.AsIs(M.Any), [])).should.throw();
      });
    });

    describe('setting', () => {
      it('should implement Symbol.iterator', () => {
        const list = M.List.fromArray([1, 2, 3, 4]);

        Array.from(list)
          .should.eql([1, 2, 3, 4]);
      });

      it('should set items in the list correctly', () => {
        const list = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoList1 = new M.List(M.Date.metadata(), list);
        const modelicoList2 = modelicoList1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoList2.innerList()[0].date().getFullYear())
          .be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.innerList()[0].date().getFullYear())
          .be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path', () => {
        const list = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoList1 = new M.List(M.Date.metadata(), list);
        const modelicoList2 = modelicoList1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(modelicoList2.innerList()[0].date().getFullYear())
          .be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.innerList()[0].date().getFullYear())
          .be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path with a single element', () => {
        const list = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoList1 = new M.List(M.Date.metadata(), list);
        const modelicoList2 = modelicoList1.setPath([0], new Date('2000-04-16T00:00:00.000Z'));

        should(modelicoList2.innerList()[0].date().getFullYear())
          .be.exactly(2000);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.innerList()[0].date().getFullYear())
          .be.exactly(1988);
      });

      it('should be able to set a whole list', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        const author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        const newListArray = author1.importantDatesList().innerList();
        newListArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

        const author2 = author1.set(
          'importantDatesList',
          new M.List(M.Date.metadata(), newListArray)
        );

        should(author1.importantDatesList().innerList().length).be.exactly(2);
        should(author1.importantDatesList().innerList()[0].date().getFullYear()).be.exactly(2013);
        should(author1.importantDatesList().innerList()[1].date().getFullYear()).be.exactly(2012);

        should(author2.importantDatesList().innerList().length).be.exactly(3);
        should(author2.importantDatesList().innerList()[0].date().getFullYear()).be.exactly(2013);
        should(author2.importantDatesList().innerList()[1].date().getFullYear()).be.exactly(2016);
        should(author2.importantDatesList().innerList()[2].date().getFullYear()).be.exactly(2012);
      });

      it('edge case when List setPath is called with an empty path', () => {
        const modelicoDatesList1 = new M.List(M.Date.metadata(), [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ]);

        const modelicoDatesList2 = [
          new M.Date(new Date('2016-04-16T00:00:00.000Z'))
        ];

        const listOfListOfDates1 = new M.List(M.List.metadata(M.Date.metadata()), [modelicoDatesList1]);
        const listOfListOfDates2 = listOfListOfDates1.setPath([0], modelicoDatesList2);

        should(listOfListOfDates1.innerList()[0].innerList()[0].date().getFullYear())
          .be.exactly(1988);

        should(listOfListOfDates2.innerList()[0].innerList()[0].date().getFullYear())
          .be.exactly(2016);
      });
    });

    describe('stringifying', () => {
      it('should stringify the list correctly', () => {
        const list = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoList = new M.List(M.Date.metadata(), list);

        JSON.stringify(modelicoList)
          .should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
      });

      it('should support null lists', () => {
        const list = null;
        const modelicoList = new M.List(M.Date.metadata(), list);

        JSON.stringify(modelicoList)
          .should.be.exactly('null');
      });
    });

    describe('parsing', () => {
      it('should parse the list correctly', () => {
        const modelicoList = JSON.parse(
          '["1988-04-16T00:00:00.000Z",null]',
          M.List.metadata(M.Date.metadata()).reviver
        );

        should(modelicoList.innerList()[0].date().getFullYear())
          .be.exactly(1988);

        should(modelicoList.innerList()[1].date())
          .be.exactly(null);
      });

      it('should be parsed correctly when used within another class', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        const author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        should(author.importantDatesList().innerList()[0].date().getFullYear()).be.exactly(2013);
      });

      it('should support null lists', () => {
        const modelicoList = JSON.parse('null', M.List.metadata(M.Date.metadata()).reviver);

        should(modelicoList.innerList())
          .be.exactly(null);
      });
    });

    describe('comparing', () => {
      it('should identify equal instances', () => {
        const modelicoList1 = new M.List(M.Date.metadata(), [
          new M.Date(new Date('1988-04-16T00:00:00.000Z'))
        ]);

        const modelicoList2 = new M.List(M.Date.metadata(), [
          new M.Date(new Date('1988-04-16T00:00:00.000Z'))
        ]);

        modelicoList1.should.not.be.exactly(modelicoList2);
        modelicoList1.should.not.equal(modelicoList2);

        modelicoList1.equals(modelicoList2).should.be.exactly(true);
      });
    });

    describe('from array', () => {
      it('should be able to create a list from an array', () => {
        const fibArray = [0, 1, 1, 2, 3, 5, 8];

        const modelicoSet = M.List.fromArray(fibArray);

        modelicoSet.innerList()
          .should.eql([0, 1, 1, 2, 3, 5, 8]);
      });
    });
  };

  var ModelicoSet = (should, M) => () => {
    const Person = PersonFactory(M);

    const Modelico = M.Modelico;

    describe('setting', () => {
      it('should implement Symbol.iterator', () => {
        const set = M.Set.fromArray([1, 2, 2, 4]);

        Array.from(set)
          .should.eql([1, 2, 4]);
      });

      it('should set items in the set correctly', () => {
        const set = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoSet1 = new M.Set(M.Date.metadata(), set);
        const modelicoSet2 = modelicoSet1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear())
          .be.exactly(1989);

        // verify that modelicoSet1 was not mutated
        should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear())
          .be.exactly(1988);
      });

      it('should set items in the set correctly when part of a path', () => {
        const set = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoSet1 = new M.Set(M.Date.metadata(), set);
        const modelicoSet2 = modelicoSet1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear())
          .be.exactly(1989);

        // verify that modelicoSet1 was not mutated
        should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear())
          .be.exactly(1988);
      });

      it('should set items in the set correctly when part of a path with a single element', () => {
        const set = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoSet1 = new M.Set(M.Date.metadata(), set);
        const modelicoSet2 = modelicoSet1.setPath([0], new Date('2000-04-16T00:00:00.000Z'));

        should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear())
          .be.exactly(2000);

        // verify that modelicoSet1 was not mutated
        should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear())
          .be.exactly(1988);
      });

      it('should be able to set a whole set', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        const author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        const newSetArray = Array.from(author1.importantDatesSet().innerSet());
        newSetArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

        const author2 = author1.set(
          'importantDatesSet',
          new M.Set(M.Date.metadata(), newSetArray)
        );

        const author1InnerSet = author1.importantDatesSet().innerSet();

        should(author1InnerSet.size).be.exactly(2);
        should(Array.from(author1InnerSet)[0].date().getFullYear()).be.exactly(2013);
        should(Array.from(author1InnerSet)[1].date().getFullYear()).be.exactly(2012);

        const author2InnerSet = author2.importantDatesSet().innerSet();

        should(author2InnerSet.size).be.exactly(3);
        should(Array.from(author2InnerSet)[0].date().getFullYear()).be.exactly(2013);
        should(Array.from(author2InnerSet)[1].date().getFullYear()).be.exactly(2016);
        should(Array.from(author2InnerSet)[2].date().getFullYear()).be.exactly(2012);
      });

      it('edge case when Set setPath is called with an empty path', () => {
        const modelicoDatesSet1 = new M.Set(M.Date.metadata(), [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ]);

        const modelicoDateSet2 = new Set([
          new M.Date(new Date('2016-04-16T00:00:00.000Z'))
        ]);

        const setOfSetsOfDates1 = new M.Set(M.Set.metadata(M.Date.metadata()), [modelicoDatesSet1]);
        const setOfSetsOfDates2 = setOfSetsOfDates1.setPath([0], modelicoDateSet2);

        should(Array.from(Array.from(setOfSetsOfDates1.innerSet())[0].innerSet())[0].date().getFullYear())
          .be.exactly(1988);

        should(Array.from(Array.from(setOfSetsOfDates2.innerSet())[0].innerSet())[0].date().getFullYear())
          .be.exactly(2016);
      });
    });

    describe('stringifying', () => {
      it('should stringify the set correctly', () => {
        const set = [
          new M.Date(new Date('1988-04-16T00:00:00.000Z')),
          new M.Date(null)
        ];

        const modelicoSet = new M.Set(M.Date.metadata(), set);

        JSON.stringify(modelicoSet)
          .should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
      });

      it('should support null sets', () => {
        const set = null;
        const modelicoSet = new M.Set(M.Date.metadata(), set);

        JSON.stringify(modelicoSet)
          .should.be.exactly('null');
      });
    });

    describe('parsing', () => {
      it('should parse the set correctly', () => {
        const modelicoSet = JSON.parse(
          '["1988-04-16T00:00:00.000Z",null]',
          M.Set.metadata(M.Date.metadata()).reviver
        );

        should(Array.from(modelicoSet.innerSet())[0].date().getFullYear())
          .be.exactly(1988);

        should(Array.from(modelicoSet.innerSet())[1].date())
          .be.exactly(null);
      });

      it('should be parsed correctly when used within another class', () => {
        const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        const author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        should(Array.from(author.importantDatesSet().innerSet())[0].date().getFullYear())
          .be.exactly(2013);
      });

      it('should support null sets', () => {
        const modelicoSet = JSON.parse('null', M.Set.metadata(M.Date.metadata()).reviver);

        should(modelicoSet.innerSet())
          .be.exactly(null);
      });
    });

    describe('comparing', () => {
      it('should identify equal instances', () => {
        const modelicoSet1 = new M.Set(M.Date.metadata(), [
          new M.Date(new Date('1988-04-16T00:00:00.000Z'))
        ]);

        const modelicoSet2 = new M.Set(M.Date.metadata(), [
          new M.Date(new Date('1988-04-16T00:00:00.000Z'))
        ]);

        modelicoSet1.should.not.be.exactly(modelicoSet2);
        modelicoSet1.should.not.equal(modelicoSet2);

        modelicoSet1.equals(modelicoSet2).should.be.exactly(true);
      });
    });

    describe('from array', () => {
      it('should be able to create a set from an array', () => {
        const fibArray = [0, 1, 1, 2, 3, 5, 8];

        const modelicoSet = M.Set.fromArray(fibArray);

        Array.from(modelicoSet.innerSet())
          .should.eql([0, 1, 2, 3, 5, 8]);
      });
    });

    describe('from set', () => {
      it('should be able to create a set from a native set', () => {
        const fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

        const modelicoSet = M.Set.fromSet(fibSet);

        Array.from(modelicoSet.innerSet())
          .should.eql([0, 1, 2, 3, 5, 8]);
      });
    });
  };

  var setPath = (should, M) => () => {
    it('should work across types', () => {
      const hammer = M.Map.fromObject({hammer: 'Can’t Touch This'});
      const array1 = M.List.fromArray(['totally', 'immutable', hammer]);

      array1.innerList()[1] = 'I’m going to mutate you!';
      (array1.innerList()[1]).should.be.exactly('immutable');

      array1.setPath([2, 'hammer'], 'hm, surely I can mutate this nested object...');

      array1.innerList()[2].innerMap().get('hammer')
        .should.be.exactly('Can’t Touch This');
    });

    it('should work across types (2)', () => {
      const list = M.List.fromArray(['totally', 'immutable']);
      const hammer1 = M.Map.fromObject({hammer: 'Can’t Touch This', list});

      hammer1.innerMap().set('hammer', 'I’m going to mutate you!');
      hammer1.innerMap().get('hammer').should.be.exactly('Can’t Touch This');

      hammer1.setPath(['list', 1], 'hm, surely I can mutate this nested object...');

      (hammer1.innerMap().get('list').innerList()[1])
        .should.be.exactly('immutable');
    });

    it('should work across types (3)', () => {
      const mySet = M.Set.fromArray(['totally', 'immutable']);
      const hammer1 = M.Map.fromObject({hammer: 'Can’t Touch This', mySet});

      hammer1.innerMap().set('hammer', 'I’m going to mutate you!');
      hammer1.innerMap().get('hammer').should.be.exactly('Can’t Touch This');

      hammer1.setPath(['mySet', 1], 'hm, surely I can mutate this nested object...');

      (hammer1.innerMap().get('mySet').innerSet().has('immutable'))
        .should.be.exactly(true);
    });
  };

  var exampleSimple = (should, M) => () => {
    const Modelico = M.Modelico;
    const AsIs = M.AsIs;
    const List = M.List;

    class Animal extends Modelico {
      constructor(fields) {
        super(Animal, fields);
      }

      speak() {
        const name = this.fields().name;
        return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
      }
    }

    it('should showcase the main features', () => {
      const petJson = `{"name": "Robbie"}`;

      const pet1 = JSON.parse(petJson, Modelico.metadata(Animal).reviver);

      pet1.speak()
        .should.be.exactly('My name is Robbie!');

      const pet2 = pet1.set('name', 'Bane');

      pet2.name().should.be.exactly('Bane');
      pet1.name().should.be.exactly('Robbie');
    });
  };

  var exampleAdvanced = (should, M) => () => {
    const Modelico = M.Modelico;
    const AsIs = M.AsIs;
    const List = M.List;

    class Animal extends Modelico {
      constructor(fields) {
        super(Animal, fields);
      }

      speak() {
        const name = this.fields().name;
        return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
      }

      static metadata() {
        return Modelico.metadata(Animal);
      }
    }

    class Person extends Modelico {
      constructor(fields) {
        super(Person, fields);
      }

      fullName() {
        const fields = this.fields();
        return [fields.givenName, fields.familyName].join(' ').trim();
      }

      static innerTypes() {
        return Object.freeze({
          'givenName': AsIs(M.Any),
          'familyName': AsIs(String),
          'pets': List.metadata(Animal.metadata())
        });
      }
    }

    it('should showcase the main features', () => {
      const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [{
        "name": "Robbie"
      }]
    }`;

      const person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      const person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      person1.pets().innerList().shift().speak()
        .should.be.exactly('My name is Robbie!');

      person1.pets().innerList().shift().speak()
        .should.be.exactly('My name is Robbie!');

      const person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

      person3.pets().innerList()[0].name()
        .should.be.exactly('Bane');

      person1.pets().innerList()[0].name()
        .should.be.exactly('Robbie');
    });
  };

  var exampleAdvancedES5 = (should, M) => () => {
    const Modelico = M.Modelico;
    const AsIs = M.AsIs;
    const List = M.List;

    function Animal(fields) {
      Modelico.factory(Animal, fields, this);
    }

    Animal.prototype = Object.create(Modelico.prototype);

    Animal.prototype.speak = function() {
      var name = this.fields().name;
      return (name === undefined) ? "I don't have a name" : 'My name is ' + name + '!';
    };

    Animal.metadata = Modelico.metadata.bind(undefined, Animal);

    function Person(fields) {
      Modelico.factory(Person, fields, this);
    }

    Person.prototype = Object.create(Modelico.prototype);

    Person.prototype.fullName = function() {
      var fields = this.fields();
      return [fields.givenName, fields.familyName].join(' ').trim();
    };

    Person.innerTypes = function() {
      return Object.freeze({
        'givenName': AsIs(String),
        'familyName': AsIs(String),
        'pets': List.metadata(Animal.metadata())
      });
    };

    it('should showcase the main features', () => {
      const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [{
        "name": "Robbie"
      }]
    }`;

      const person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      const person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      person1.pets().innerList().shift().speak()
        .should.be.exactly('My name is Robbie!');

      person1.pets().innerList().shift().speak()
        .should.be.exactly('My name is Robbie!');
    });
  };

  var CountryFactory = (M, Region) => {
    const Modelico = M.Modelico;

    class Country extends Modelico {
      constructor(fields) {
        super(Country, fields);

        return Object.freeze(this);
      }

      static innerTypes() {
        return Object.freeze({
          'name': M.AsIs(String),
          'region': Region.metadata()
        });
      }

      static metadata() {
        return Modelico.metadata(Country);
      }
    }

    return Object.freeze(Country);
  };

  var CityFactory = (M, Region) => {
    const Modelico = M.Modelico;
    const Country = CountryFactory(M, Region);

    class City extends Modelico {
      constructor(fields) {
        super(City, fields);

        return Object.freeze(this);
      }

      static innerTypes() {
        return Object.freeze({
          'name': M.AsIs(String),
          'country': Country.metadata()
        });
      }

      static metadata() {
        return Modelico.metadata(City);
      }
    }

    return Object.freeze(City);
  };

  var RegionFactory = M => {
    const Modelico = M.Modelico;

    class Region extends Modelico {
      constructor(fields) {
        super(Region, fields);

        return Object.freeze(this);
      }

      customMethod() {
        return `${this.name()} (${this.code()})`;
      }

      static innerTypes() {
        return Object.freeze({
          'name': M.AsIs(String)
        });
      }

      static metadata() {
        return Modelico.metadata(Region);
      }
    }

    return Object.freeze(Region);
  };

  var RegionIncompatibleNameKeyFactory = M => {
    const Modelico = M.Modelico;

    class Region extends Modelico {
      constructor(fields) {
        super(Region, fields);

        return Object.freeze(this);
      }

      customMethod() {
        return `${this.name()} (${this.code()})`;
      }

      static innerTypes() {
        return Object.freeze({
          'name': M.AsIs(M.Any)
        });
      }

      static metadata() {
        return Modelico.metadata(Region);
      }
    }

    return Object.freeze(Region);
  };

  var exampleDeepNesting = (should, M) => () => {
    const Modelico = M.Modelico;

    it('should revive deeply nested JSON', () => {
      const City = CityFactory(M, RegionFactory(M));
      const cityJson = `{"name":"Pamplona","country":{"name":"Spain","region":{"name":"Europe","code":"EU"}}}`;

      const city = JSON.parse(cityJson, Modelico.metadata(City).reviver);

      city.name().should.be.exactly('Pamplona');
      city.country().name().should.be.exactly('Spain');
      city.country().region().customMethod().should.be.exactly('Europe (EU)');
    });

    it('should throw when an object has incompatible nested keys', () => {
      const City = CityFactory(M, RegionIncompatibleNameKeyFactory(M));
      const cityJson = `{"name":"Pamplona","country":{"name":"Spain","region":{"name":"Europe","code":"EU"}}}`;

      (() => JSON.parse(cityJson, Modelico.metadata(City).reviver))
        .should.throw(`Duplicated typed key 'name' with types String and Any`);
    });
  };

  var Immutable = (U, should, M) => () => {
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
        new Map([].concat(Array.from(map1.innerMap()), Array.from(map2.innerMap()), objToArr(obj)))
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

  var ImmutableProxied = (U, should, M) => () => {
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
      var list4 = list1.concat(Array.from(list2), Array.from(list3));

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
        new Map([].concat(Array.from(map1.entries()), Array.from(map2.entries()), objToArr(obj)))
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

  var proxyMap = (should, M) => () => {
    var p = M.proxyMap;

    it('size', () => {
      const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

      (map.size).should.be.exactly(3);
    });

    it('get() / set() / delete() / clear()', () => {
      const map1 = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

      const map2 = map1.set('b', 50);

      (map1.get('b')).should.be.exactly(2);
      (map2.get('b')).should.be.exactly(50);

      const map3 = map2.delete('c');

      (map2.get('c')).should.be.exactly(3);
      (map3.has('c')).should.be.exactly(false);

      const map4 = map3.clear();

      (map3.size).should.be.exactly(2);
      (map4.size).should.be.exactly(0);
    });

    it('entries()', () => {
      const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

      Array.from(map.entries())
        .should.eql([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('values() / keys() / [@@iterator]()', () => {
      const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

      Array.from(map.values())
        .should.eql([1, 2, 3]);

      Array.from(map.keys())
        .should.eql(['a', 'b', 'c']);

      Array.from(map[Symbol.iterator]())
        .should.eql([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('forEach()', () => {
      const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

      let sum = 0;
      let keys = '';

      map.forEach((v, k) => {
        sum += v;
        keys += k.toUpperCase();
      });

      (sum).should.be.exactly(6);
      (keys).should.be.exactly('ABC');
    });
  };

  var proxyList = (should, M) => () => {
    const p = M.proxyList;

    it('length', () => {
      const list1 = p(M.List.fromArray([1, 2, 2, 3]));

      (list1.length).should.be.exactly(4);
    });

    it('[n]', () => {
      const list1 = p(M.List.fromArray([1, 2, 2, 3]));

      (list1[0]).should.be.exactly(1);
      (list1[1]).should.be.exactly(2);
      (list1[2]).should.be.exactly(2);
      (list1[3]).should.be.exactly(3);

      should(list1[4]).be.exactly(undefined);

      (list1['0']).should.be.exactly(1);
      (list1['1']).should.be.exactly(2);
      (list1['2']).should.be.exactly(2);
      (list1['3']).should.be.exactly(3);

      should(list1['4']).be.exactly(undefined);
    });

    it('includes()', () => {
      const list = p(M.List.fromArray([1, 2, 3]));

      list.includes(2)
        .should.be.exactly(true);

      list.includes(4)
        .should.be.exactly(false);

      list.includes(3, 3)
        .should.be.exactly(false);

      list.includes(3, -1)
        .should.be.exactly(true);

      p(M.List.fromArray([1, 2, NaN])).includes(NaN)
        .should.be.exactly(true);
    });

    it('join()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      list.join('-')
        .should.be.exactly('1-2-2-3');
    });

    it('indexOf()', () => {
      const list = p(M.List.fromArray([2, 9, 9]));

      list.indexOf(2)
        .should.be.exactly(0);

      list.indexOf(7)
        .should.be.exactly(-1);

      list.indexOf(9, 2)
        .should.be.exactly(2);

      list.indexOf(9)
        .should.be.exactly(1);

      list.indexOf(2, -1)
        .should.be.exactly(-1);

      list.indexOf(2, -3)
        .should.be.exactly(0);
    });

    it('lastIndexOf()', () => {
      const list = p(M.List.fromArray([2, 5, 9, 2]));

      list.lastIndexOf(2)
        .should.be.exactly(3);

      list.lastIndexOf(7)
        .should.be.exactly(-1);

      list.lastIndexOf(2, 3)
        .should.be.exactly(3);

      list.lastIndexOf(2, 2)
        .should.be.exactly(0);

      list.lastIndexOf(2, -2)
        .should.be.exactly(0);

      list.lastIndexOf(2, -1)
        .should.be.exactly(3);
    });

    it('concat()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      list.concat(100).toJSON()
        .should.eql([1, 2, 2, 3, 100]);

      list.concat([100, 200]).toJSON()
        .should.eql([1, 2, 2, 3, 100, 200]);
    });

    it('slice()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      list.slice(1).toJSON()
        .should.eql([2, 2, 3]);

      list.slice(2).set(0, 100).toJSON()
        .should.eql([100, 3]);

      list.slice(2).toJSON()
        .should.eql([2, 3]);

      list.slice(-3).toJSON()
        .should.eql([2, 2, 3]);

      list.slice(0, -2).toJSON()
        .should.eql([1, 2]);
    });

    it('filter()', () => {
      const list = p(M.List.fromArray([1, 2, 3]));

      list.filter(x => (x % 2 === 1)).toJSON()
        .should.eql([1, 3]);
    });

    it('forEach()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      let sum = 0;
      list.forEach(x => sum += x);

      (sum).should.be.exactly(8);
    });

    it('keys() / entries() / [@@iterator]()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      Array.from(list.entries())
        .should.eql([[0, 1], [1, 2], [2, 2], [3, 3]]);

      Array.from(list.keys())
        .should.eql([0, 1, 2, 3 ]);

      Array.from(list[Symbol.iterator]())
        .should.eql([1, 2, 2, 3]);
    });

    it('every() / some()', () => {
      const list = p(M.List.fromArray([1, 2, 3]));

      list.every(x => x < 5)
        .should.be.exactly(true);

      list.every(x => x < 3)
        .should.be.exactly(false);

      list.some(x => x > 5)
        .should.be.exactly(false);

      list.some(x => x < 3)
        .should.be.exactly(true);
    });

    it('find() / findIndex()', () => {
      const list = p(M.List.fromArray([2, 5, 9, 2]));

      const multipleOf = x => n => (n % x === 0);

      list.find(multipleOf(3))
        .should.be.exactly(9);

      list.findIndex(multipleOf(3))
        .should.be.exactly(2);
    });

    it('reduce() / reduceRight()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      list.reduce((a, b) => a + b, 0)
        .should.be.exactly(8);

      list.reduce((str, x) => str + x, '')
        .should.be.exactly('1223');

      list.reduceRight((str, x) => str + x, '')
        .should.be.exactly('3221');
    });

    it('reverse()', () => {
      const list = p(M.List.fromArray([1, 2, 2, 3]));

      list.reverse().toJSON()
        .should.eql([3, 2, 2, 1]);

      list.toJSON()
        .should.eql([1, 2, 2, 3]);
    });

    it('copyWithin()', () => {
      const list = p(M.List.fromArray([1, 2, 3, 4, 5]));

      list.copyWithin(-2).toJSON()
        .should.eql([1, 2, 3, 1, 2]);

      list.copyWithin(0, 3).toJSON()
        .should.eql([4, 5, 3, 4, 5]);

      list.copyWithin(0, 3, 4).toJSON()
        .should.eql([4, 2, 3, 4, 5]);

      list.copyWithin(-2, -3, -1).toJSON()
        .should.eql([1, 2, 3, 3, 4]);
    });

    it('fill()', () => {
      const list = p(M.List.fromArray([1, 2, 3]));

      list.fill(4).toJSON()
        .should.eql([4, 4, 4]);

      list.fill(4, 1, 2).toJSON()
        .should.eql([1, 4, 3]);

      list.fill(4, 1, 1).toJSON()
        .should.eql([1, 2, 3]);

      list.fill(4, -3, -2).toJSON()
        .should.eql([4, 2, 3]);

      list.fill(4, NaN, NaN).toJSON()
        .should.eql([1, 2, 3]);

      p(M.List.fromArray(Array(3))).fill(4).toJSON()
        .should.eql([4, 4, 4]);
    });

    it('sort()', () => {
      const list = p(M.List.fromArray([1, 2, 5, 4, 3]));

      list.sort().toJSON()
        .should.eql([1, 2, 3, 4, 5]);

      list.sort().toJSON()
        .should.eql([1, 2, 3, 4, 5]);
    });

    it('sort(fn)', () => {
      const list = p(M.List.fromArray([1, 2, 5, 4, 3]));

      const isEven = n => (n % 2 === 0);

      const evensBeforeOdds = (a, b) => {
        if (isEven(a)) {
          return isEven(b) ? a - b : -1;
        }

        return isEven(b) ? 1 : a - b;
      };

      list.sort(evensBeforeOdds).toJSON()
        .should.eql([2, 4, 1, 3, 5]);
    });

    it('map()', () => {
      const list = p(M.List.fromArray([1, 2, 3]));

      list.map(x => x + 10)
        .should.eql([11, 12, 13]);
    });
  };

  var proxySet = (should, M) => () => {
    const p = M.proxySet;

    it('size', () => {
      const set = p(M.Set.fromArray([1, 2, 2, 3]));

      (set.size).should.be.exactly(3);
    });

    it('has() / add() / delete() / clear()', () => {
      const set1 = p(M.Set.fromArray([1, 2, 2, 3]));

      (set1.has(3)).should.be.exactly(true);
      (set1.has(50)).should.be.exactly(false);

      const set2 = set1.add(50);

      (set1.has(50)).should.be.exactly(false);
      (set2.has(50)).should.be.exactly(true);

      const set3 = set2.delete(50);

      (set2.has(50)).should.be.exactly(true);
      (set3.has(50)).should.be.exactly(false);

      const set4 = set1.clear();

      (set4.size).should.be.exactly(0);
    });

    it('entries()', () => {
      const set = p(M.Set.fromArray([1, 2, 2, 3]));

      Array.from(set.entries())
        .should.eql([[1, 1], [2, 2], [3, 3]]);
    });

    it('values() / keys() / [@@iterator]()', () => {
      const set = p(M.Set.fromArray([1, 2, 2, 3]));

      Array.from(set.values())
        .should.eql([1, 2, 3]);

      Array.from(set.keys())
        .should.eql([1, 2, 3]);

      Array.from(set[Symbol.iterator]())
        .should.eql([1, 2, 3]);
    });

    it('forEach()', () => {
      const set = p(M.Set.fromArray([1, 2, 2, 3]));

      let sum = 0;
      set.forEach(x => sum += x);

      (sum).should.be.exactly(6);
    });
  };

  var proxyDate = (should, M) => () => {
    const p = M.proxyDate;

    it('getters / setters', () => {
      const date1 = p(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

      const date2 = date1.setFullYear(2015);
      const date3 = date2.setMinutes(55);

      date2.getFullYear()
        .should.be.exactly(2015);

      date1.getFullYear()
        .should.be.exactly(1988);

      date1.getMinutes()
        .should.be.exactly(0);

      date3.getMinutes()
        .should.be.exactly(55);
    });
  };

  const hasObjectFreeze = (() => {
    const a = {};

    try{
      Object.freeze(a);
    } catch(e) {
      return false;
    }

    try {
      a.test = 1;
      return false;
    } catch(ignore) {}

    return true;
  })();

  const hasProxies = (() => {
    try {
      new Proxy({}, {});

      return true;
    } catch (ignore) {}

    return false;
  })();

  const buildUtils = (options) => Object.freeze({
    skipIfNoProxies: hasProxies ? it : it.skip,
    skipDescribeIfNoProxies: hasProxies ? describe : describe.skip,
    skipIfNoObjectFreeze: hasObjectFreeze ? it : it.skip,
    objToArr: obj => Object.keys(obj).map(k => [k, obj[k]])
  });

  var modelicoSpec = (options, should, M) => _ => {
    const U = buildUtils(options);
    const deps = [should, M];
    const utilsAndDeps = [U].concat(deps);

    describe('Base', Modelico.apply(_, deps));
    describe('AsIs', ModelicoAsIs.apply(_, utilsAndDeps));
    describe('Map', ModelicoMap.apply(_, deps));
    describe('EnumMap', ModelicoEnumMap.apply(_, deps));
    describe('ModelicoList', ModelicoList.apply(_, deps));
    describe('ModelicoSet', ModelicoSet.apply(_, deps));

    describe('setPath', setPath.apply(_, deps));

    describe('Readme simple example', exampleSimple.apply(_, deps));
    describe('Readme advanced example', exampleAdvanced.apply(_, deps));
    describe('Readme advanced example ES5', exampleAdvancedES5.apply(_, deps));
    describe('Deep nesting example', exampleDeepNesting.apply(_, deps));
    describe('Immutable.js examples', Immutable.apply(_, utilsAndDeps));

    U.skipDescribeIfNoProxies(
      'Immutable.js examples (proxied)',
      ImmutableProxied.apply(_, utilsAndDeps)
    );

    U.skipDescribeIfNoProxies('Proxies', () => {
      describe('Map', proxyMap.apply(_, deps));
      describe('List', proxyList.apply(_, deps));
      describe('Set', proxySet.apply(_, deps));
      describe('Date', proxyDate.apply(_, deps));
    });
  };

  return modelicoSpec;

}));