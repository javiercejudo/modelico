/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  const {any, number, string, withDefault} = M.ajvMetadata(Ajv())

  it('should allow enhancing metadata to have default values', () => {
    class Book
      extends M.createModel(
        {
          title: string(),
          author: withDefault(string(), 'anonymous')
        },
        {
          stringTag: 'Book'
        }
      ) {
      constructor(props) {
        super(Book, props)
      }

      getTitleBy() {
        return `"${this.title()}" by ${this.author()}`
      }

      static innerTypes() {
        return super.innerTypes()
      }
    }

    const lazarillo1 = M.fromJS(Book, {
      title: 'Lazarillo de Tormes'
    })

    lazarillo1
      .getTitleBy()
      .should.be.exactly('"Lazarillo de Tormes" by anonymous')

    const lazarillo2 = new Book({
      title: 'Lazarillo de Tormes'
    })

    lazarillo2
      .getTitleBy()
      .should.be.exactly('"Lazarillo de Tormes" by anonymous')
  })

  it('should use the metadata to coerce the value if necessary', () => {
    class CountryCallingCode
      extends M.createModel(m => ({
        code: withDefault(m.number(), '34')
      })) {
      constructor(props) {
        super(CountryCallingCode, props)
      }

      static innerTypes() {
        return super.innerTypes()
      }
    }

    const spain = M.fromJS(CountryCallingCode, {})

    spain.code().should.be.exactly(34)
  })

  it('should have a proper reviver', () => {
    JSON.parse('null', withDefault(number(), 1).reviver).should.be.exactly(1)
    JSON.parse('2', withDefault(number(), 1).reviver).should.be.exactly(2)

    JSON.parse(
      'null',
      withDefault(any(), {foo: 0}).reviver
    ).foo.should.be.exactly(0)

    JSON.parse(
      '{"foo": 1}',
      withDefault(any(), {foo: 0}).reviver
    ).foo.should.be.exactly(1)
  })

  it('should not validate the default value', () => {
    let res

    should(() => {
      res = JSON.parse('null', withDefault(number({}, {minimum: 5}), 1).reviver)
    }).not.throw()

    res.should.be.exactly(1)
  })

  it('should work well with ajvMetadata', () => {
    JSON.parse('null', withDefault(number(), 1).reviver).should.be.exactly(1)
    JSON.parse('2', withDefault(number(), 1).reviver).should.be.exactly(2)

    should(() => {
      JSON.parse('2', withDefault(number({}, {minimum: 5}), 1).reviver)
    }).throw(/should be >= 5/)
  })

  it('should work well with getSchema', () => {
    const nm = M.metadata()

    M.getSchema(withDefault(nm.string(), '')).should.deepEqual({
      type: {},
      default: ''
    })

    M.getSchema(withDefault(number(), 1)).should.deepEqual({
      anyOf: [{type: 'null'}, {type: 'number'}],
      default: 1
    })

    M.getSchema(nm.number()).should.deepEqual({})

    M.getSchema(number()).should.deepEqual({
      type: 'number'
    })
  })
}
