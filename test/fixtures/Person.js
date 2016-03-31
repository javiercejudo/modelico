/*jshint node:true, esnext:true */

'use strict';

const M = require('../../');

const PartOfDay = require('./PartOfDay').metadata;
const Sex = require('./Sex').metadata;

const Modelico = M.Modelico;

const ModelicoPrimitive = M.ModelicoPrimitive.metadata;
const ModelicoDate = M.ModelicoDate.metadata;
const ModelicoMap = M.ModelicoMap.metadata;
const ModelicoList = M.ModelicoList.metadata;

const joinWithSpace = (arr) => arr.filter(x => x !== null && x !== undefined).join(' ');

class Person extends Modelico {
  constructor(fields) {
    super(Person, fields);
  }

  fullName() {
    return joinWithSpace([this.givenName, this.familyName]);
  }

  static get metadata() {
    return {
      'birthday': ModelicoDate(),
      'favouritePartOfDay': PartOfDay(),
      'lifeEvents': ModelicoMap(ModelicoPrimitive(String), ModelicoDate()),
      'importantDatesList': ModelicoList(ModelicoDate()),
      'sex': Sex()
    };
  }
}

module.exports = Person;
