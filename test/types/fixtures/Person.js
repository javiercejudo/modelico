'use strict';

import PartOfDayFactory from './PartOfDay';
import SexFactory from './Sex';

export default M => {
  const PartOfDay = PartOfDayFactory(M);
  const Sex = SexFactory(M);

  const Base = M.Base;
  const joinWithSpace = (...parts) => parts.filter(x => x !== null && x !== undefined).join(' ');

  const { asIs, date, map, list, set, maybe } = M.metadata;
  const partOfDay = PartOfDay.metadata;
  const sex = Sex.metadata;

  class Person extends Base {
    constructor(fields) {
      super(Person, fields);

      Object.freeze(this);
    }

    fullName() {
      return joinWithSpace(this.givenName(), this.familyName());
    }

    static innerTypes() {
      return Object.freeze({
        givenName: asIs(String),
        familyName: asIs(String),
        birthday: date(),
        favouritePartOfDay: partOfDay(),
        lifeEvents: map(asIs(String), date()),
        importantDatesList: list(date()),
        importantDatesSet: set(date()),
        sex: maybe(sex())
      });
    }

    static metadata() {
      return Base.metadata(Person);
    }
  }

  return Object.freeze(Person);
};
