/*jshint node:true, esnext:true, mocha:true */

'use strict';

require('should');

const fs = require('fs');
const Modelico = require('../').Modelico;
const Person = require('./fixtures/Person');
const SerialisableDate = require('./fixtures/SerialisableDate');
const PartOfDay = require('./fixtures/PartOfDay');
const Sex = require('./fixtures/Sex');

const authorJson = fs.readFileSync(__dirname + '/fixtures/author.json').toString();

describe('stringifying', function() {
  it('should stringify types correctly', function() {
    const author = new Person({
      givenName: 'Javier',
      familyName: 'Cejudo',
      birthday: new SerialisableDate({date: new Date('1988-04-16T00:00:00.000Z')}),
      favouritePartOfDay: PartOfDay.EVENING,
      sex: Sex.MALE
    });

    JSON.stringify(author).concat("\n")
      .should.be.exactly(authorJson);
  });
});

describe('parsing', function() {
  it('should parse types correctly', function() {
    const author = Modelico.fromJSON(Person, authorJson);
    const authorAlt = JSON.parse(authorJson, Modelico.buildReviver(Person));

    'Javier Cejudo'
      .should.be.exactly(author.fullName())
      .and.exactly(authorAlt.fullName());

    (1988)
      .should.be.exactly(author.birthday.date.getFullYear())
      .and.exactly(authorAlt.birthday.date.getFullYear());

    (PartOfDay.EVENING.minTime)
      .should.be.exactly(author.favouritePartOfDay.minTime)
      .and.exactly(authorAlt.favouritePartOfDay.minTime);

    (Sex.MALE)
      .should.be.exactly(author.sex)
      .and.exactly(authorAlt.sex);
  });
});

describe('cloning', function() {
  it('should support cloning', function() {
    const author = new Person({
      givenName: 'Javier',
      familyName: 'Cejudo',
      birthday: new SerialisableDate({date: new Date('1988-04-16T00:00:00.000Z')})
      // equivalent but perhaps more convenient:
      // birthday: SerialisableDate.reviver('', '1988-04-16T00:00:00.000Z')
    });

    const authorClone = author.clone();
    const birthdayClone = author.birthday.clone();

    'Javier'
      .should.be.exactly(author.givenName)
      .and.exactly(authorClone.givenName);

    author.should.not.be.exactly(authorClone);

    (1988)
      .should.be.exactly(author.birthday.date.getFullYear())
      .and.exactly(birthdayClone.date.getFullYear());

    author.birthday
      .should.not.be.exactly(birthdayClone);
  });
});

describe('comparing', function() {
  it('should identify equal instances', function() {
    const author1 = new Person({
      givenName: 'Javier',
      familyName: 'Cejudo',
      birthday: SerialisableDate.reviver('', '1988-04-16T00:00:00.000Z')
    });

    const author2 = new Person({
      givenName: 'Javier',
      familyName: 'Cejudo',
      birthday: SerialisableDate.reviver('', '1988-04-16T00:00:00.000Z')
    });

    const author3 = new Person({
      givenName: 'Javier',
      familyName: 'Cejudo Goñi',
      birthday: SerialisableDate.reviver('', '1988-04-16T00:00:00.000Z')
    });

    author1.equals(author2).should.be.exactly(true);
    author1.equals(author3).should.be.exactly(false);

    author1.should.not.be.exactly(author2);
  });
});
