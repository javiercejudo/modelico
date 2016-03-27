/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('../../').Modelico;
const SerialisableDate = require('./SerialisableDate');
const PartOfDay = require('./PartOfDay');
const Sex = require('./Sex');

class Person extends Modelico {
  constructor(fields) {
    super(Person, fields);
  }

  static get types() {
    return {
      'birthday': SerialisableDate,
      'favouritePartOfDay': PartOfDay,
      'sex': Sex
    };
  }

  fullName() {
    return [
      this.givenName,
      this.familyName
    ].filter(x => x !== null && x !== undefined).join(' ');
  }
}

module.exports = Person;
