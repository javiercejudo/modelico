'use strict';

module.exports = M => {
  const PartOfDay = require('./PartOfDay')(M).metadata;
  const Sex = require('./Sex')(M).metadata;

  const Modelico = M.Modelico;

  const ModelicoMap = M.Map.metadata;
  const ModelicoList = M.List.metadata;
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
        'sex': Sex()
      });
    }

    static metadata() {
      return Modelico.metadata(Person);
    }
  }

  return Object.freeze(Person);
};
