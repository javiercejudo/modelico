/* eslint-env mocha */

import PartOfDayFactory from './PartOfDay'
import SexFactory from './Sex'

export default M => {
  const PartOfDay = PartOfDayFactory(M)
  const Sex = SexFactory(M)

  const joinWithSpace = (...parts) => parts.filter(x => x !== null && x !== undefined).join(' ')

  const { _, string, date, map, list, set, maybe } = M.metadata
  const partOfDay = PartOfDay.metadata
  const sex = Sex.metadata

  class Person extends M.Base {
    constructor (fields) {
      super(Person, fields)

      Object.freeze(this)
    }

    fullName () {
      return joinWithSpace(this.givenName(), this.familyName())
    }

    static innerTypes () {
      return Object.freeze({
        givenName: string(),
        familyName: string(),

        birthday: _(M.Date),
        // alternative (leaving the above for testing purposes)
        // birthday: date(),

        favouritePartOfDay: partOfDay(),
        lifeEvents: map(string(), date()),
        importantDatesList: list(date()),
        importantDatesSet: set(date()),
        sex: maybe(sex())
      })
    }
  }

  return Object.freeze(Person)
}
