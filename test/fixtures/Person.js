/*jshint node:true, esnext:true */

'use strict';

module.exports = M => {
  const PartOfDay = require('./PartOfDay')(M).metadata;
  const Sex = require('./Sex')(M).metadata;
  const SerialisableDate = require('./Date')(M).metadata;

  const Modelico = M.Modelico;

  const ModelicoMap = M.ModelicoMap.metadata;
  const ModelicoList = M.ModelicoList.metadata;

  const joinWithSpace = arr => arr.filter(x => x !== null && x !== undefined).join(' ');

  class Person extends Modelico {
    constructor(fields) {
      super(Person, fields);

      Object.freeze(this);
    }

    fullName() {
      return joinWithSpace([this.givenName(), this.familyName()]);
    }

    static subtypes() {
      return Object.freeze({
        'birthday': SerialisableDate(),
        'favouritePartOfDay': PartOfDay(),
        'lifeEvents': ModelicoMap(String, SerialisableDate()),
        'importantDatesList': ModelicoList(SerialisableDate()),
        'sex': Sex()
      });
    }
  }

  return Object.freeze(Person);
};
