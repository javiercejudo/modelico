/* eslint-env mocha */

export default (M, PartOfDay, Sex) => {
  const joinWithSpace = (...parts) => parts.join(' ').trim()

  const {_, string, date, map, list, set, maybe} = M.metadata()
  const partOfDay = PartOfDay.metadata
  const sex = Sex.metadata

  class Person extends M.Base {
    fullName() {
      return joinWithSpace(this.givenName(), this.familyName())
    }

    static innerTypes() {
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
