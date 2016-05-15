'use strict';

import PartOfDayFactory from './PartOfDay';
import SexFactory from './Sex';

export default M => {
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
        birthday: M.Date.metadata(),
        favouritePartOfDay: PartOfDay(),
        lifeEvents: ModelicoMap(String, ModelicoDate()),
        importantDatesList: M.List.metadataWithOptions({nullable: false}, ModelicoDate()),
        importantDatesSet: ModelicoSet(ModelicoDate()),
        sex: Sex()
      });
    }

    static metadata() {
      return Modelico.metadata(Person);
    }
  }

  return Object.freeze(Person);
};
