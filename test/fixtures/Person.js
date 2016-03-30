/*jshint node:true, esnext:true */

'use strict';

const M = require('../../');
const PartOfDay = require('./PartOfDay');
const Sex = require('./Sex');

const Modelico = M.Modelico;
const ModelicoDate = M.ModelicoDate;
const ModelicoMap = M.ModelicoMap;

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
      'birthday': ModelicoDate.metadata(),
      'favouritePartOfDay': PartOfDay.metadata(),
      'lifeEvents': ModelicoMap.metadata(String, ModelicoDate),
      'sex': Sex.metadata()
    };
  }
}

module.exports = Person;
