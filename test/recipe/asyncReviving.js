/* eslint-env mocha */
/* global requestIdleCallback */

const schedule = (typeof requestIdleCallback !== 'undefined')
  ? requestIdleCallback
  : (typeof setImmediate !== 'undefined')
  ? setImmediate
  : fn => setTimeout(fn, 0)

const asyncMap = (
  fn,
  arr,
  {batchSize = arr.length} = {}
) => {
  return arr.reduce((acc, _, i) => {
    if (i % batchSize !== 0) {
      return acc
    }

    return acc.then(result =>
      new Promise(resolve => {
        schedule(() => {
          result.push.apply(result, arr.slice(i, i + batchSize).map(fn))
          resolve(result)
        })
      })
    )
  }, Promise.resolve([]))
}

export default (should, M) => () => {
  it('should revieve data asynchronously', () => {
    class Book extends M.createModel(m => ({
      title: m.string(),
      author: m.string()
    })) {
      constructor (props) {
        super(Book, props)
      }
    }

    class Library extends M.createModel(m => ({
      catalogue: m.list(m._(Book))
    })) {
      constructor (props) {
        super(Library, props)
      }
    }

    const libraryObj = {
      catalogue: [{
        title: 'Madame Bovary: Mœurs de province',
        author: 'Gustave Flaubert'
      }, {
        title: 'La voz a ti debida',
        author: 'Pedro Salinas'
      }, {
        title: 'Et dukkehjem',
        author: 'Henrik Ibsen'
      }, {
        title: 'Die Verwandlung',
        author: 'Franz Kafka'
      }, {
        title: 'La colmena',
        author: 'Camilo José Cela'
      }]
    }

    const emptyLibraryObj = Object.assign({}, libraryObj, {catalogue: []})
    const emptyLibrary = M.fromJS(Library, emptyLibraryObj)

    emptyLibrary.catalogue().size
      .should.be.exactly(0)

    return asyncMap(
      book => M.fromJS(Book, book),
      libraryObj.catalogue,
      { batchSize: 2 }
    )
      .then(catalogueArr => {
        const catalogue = M.List.fromArray(catalogueArr)

        return emptyLibrary.copy({catalogue})
      })
      .then(library => {
        const catalogue = library.catalogue()

        catalogue.size
          .should.be.exactly(5)

        catalogue.get(0).title()
          .should.be.exactly('Madame Bovary: Mœurs de province')

        catalogue.getIn([4, 'title'])
          .should.be.exactly('La colmena')
      })
  })
}
