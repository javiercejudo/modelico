'use strict';

import PartOfDayFactory from './PartOfDay';
import SexFactory from './Sex';

export default M => {
  const PartOfDay = PartOfDayFactory(M);
  const Sex = SexFactory(M);

  const Modelico = M.Modelico;
  const joinWithSpace = (...parts) => parts.filter(x => x !== null && x !== undefined).join(' ');

  class Person extends Modelico {
    constructor(fields) {
      super(Person, fields);

      Object.freeze(this);
    }

    fullName() {
      return joinWithSpace(this.givenName(), this.familyName());
    }

    static innerTypes() {
      return Object.freeze({
        givenName: M.AsIs(String),
        familyName: M.AsIs(String),
        birthday: M.Date.metadata(),
        favouritePartOfDay: PartOfDay.metadata(),
        lifeEvents: M.Map.metadata(String, M.Date.metadata()),
        importantDatesList: M.List.metadata(M.Date.metadata()),
        importantDatesSet: M.Set.metadata(M.Date.metadata()),
        sex: Sex.metadata()
      });
    }

    static metadata() {
      return Modelico.metadata(Person);
    }
  }

  return Object.freeze(Person);
};
