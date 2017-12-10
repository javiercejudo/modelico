/* eslint-env mocha */

export default (should, M) => () => {
  it('caches method calls on instances (useful for expensive methods)', () => {
    let count = 0

    const getTitleBy = function() {
      count += 1

      return `"${this.title()}" by ${this.author()}`
    }

    const _Book = M.createModel(m => ({
      title: m.string(),
      author: m.withDefault(m.string(), 'anonymous')
    }))

    class Book extends _Book {
      getTitleBy() {
        return M.withCache(this, getTitleBy)
      }
    }

    const myBook = new Book({
      title: 'Das Parfum',
      author: 'Patrick Süskind'
    })

    const expected = '"Das Parfum" by Patrick Süskind'

    count.should.be.exactly(0)

    myBook.getTitleBy().should.be.exactly(expected)
    count.should.be.exactly(1)

    myBook.getTitleBy().should.be.exactly(expected)
    count.should.be.exactly(1)
  })

  it('works well with parameterised methods', () => {
    let count = 0

    const _Book = M.createModel(m => ({
      title: m.string(),
      author: m.withDefault(m.string(), 'anonymous')
    }))

    const getTitleByWithPrefix = function(prefix) {
      count += 1

      return prefix + `"${this.title()}" by ${this.author()}`
    }

    class Book extends _Book {
      getTitleByWithPrefix(prefix) {
        return M.withCache(
          this,
          getTitleByWithPrefix,
          [prefix],
          `getTitleByWithPrefix-${prefix}`
        )
      }
    }

    const myBook = new Book({
      title: 'Das Parfum',
      author: 'Patrick Süskind'
    })

    const expected = 'Book of the month: "Das Parfum" by Patrick Süskind'

    count.should.be.exactly(0)

    myBook
      .getTitleByWithPrefix('Book of the month: ')
      .should.be.exactly(expected)

    count.should.be.exactly(1)

    myBook
      .getTitleByWithPrefix('Book of the month: ')
      .should.be.exactly(expected)

    count.should.be.exactly(1)
  })

  it('works well with static methods', () => {
    let count = 0

    const description = () => {
      count += 1

      // source: https://en.oxforddictionaries.com/definition/book
      return [
        'Represents a written or printed work consisting of pages glued or',
        'sewn together along one side and bound in covers.'
      ].join(' ')
    }

    const _Book = M.createModel(m => ({
      title: m.string(),
      author: m.withDefault(m.string(), 'anonymous')
    }))

    class Book extends _Book {
      static description() {
        return M.withCache(Book, description)
      }
    }

    const expected =
      'Represents a written or printed work consisting of pages glued or sewn together along one side and bound in covers.'

    count.should.be.exactly(0)

    Book.description().should.be.exactly(expected)
    count.should.be.exactly(1)

    Book.description().should.be.exactly(expected)
    count.should.be.exactly(1)
  })
}
