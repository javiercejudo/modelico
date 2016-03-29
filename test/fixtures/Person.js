/*jshint node:true, esnext:true */

'use strict';

const M = require('../../');
const PartOfDay = require('./PartOfDay');
const Sex = require('./Sex');

const Modelico = M.Modelico;
const ModelicoDate = M.ModelicoDate;

const joinWithSpace = (arr) => arr.filter(x => x !== null && x !== undefined).join(' ');

class Person extends Modelico {
  constructor(fields) {
    super(Person, fields);
  }

  static get types() {
    return {
      'birthday': ModelicoDate,
      'favouritePartOfDay': PartOfDay,
      'sex': Sex
    };
  }

  fullName() {
    return joinWithSpace([this.givenName, this.familyName]);
  }
}

module.exports = Person;
