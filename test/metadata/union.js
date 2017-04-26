/* eslint-env mocha */

export default (should, M) => () => {
  it('should help create union types', () => {
    const {_, string, base, union} = M.metadata()

    const userClassifier = obj => _(obj === null ? Anonymous : Named)

    class User extends M.Base {
      displayName() {
        return this.isAnonymous() ? 'anonymous' : this.name()
      }

      static metadata() {
        return union(User, [Anonymous, Named], userClassifier)
      }
    }

    class Anonymous extends User {
      constructor() {
        super(Anonymous)
      }

      toJSON() {
        return null
      }

      isAnonymous() {
        return true
      }

      static metadata() {
        return base(Anonymous)
      }
    }

    class Named extends User {
      constructor(props) {
        super(Named, props)
      }

      isAnonymous() {
        return false
      }

      static innerTypes() {
        return Object.freeze({
          name: string()
        })
      }

      static metadata() {
        return base(Named)
      }
    }

    const user1 = M.fromJS(User, null)
    const user2 = M.fromJS(User, {name: 'John'})

    user1.isAnonymous().should.be.exactly(true)
    user2.isAnonymous().should.be.exactly(false)

    user1.displayName().should.be.exactly('anonymous')
    user2.displayName().should.be.exactly('John')
  })

  it('should have a proper reviver', () => {
    const {union} = M.metadata()

    class Foo extends M.createModel(m => ({a: m.number()})) {
      constructor(props) {
        super(Foo, props)
      }
    }

    JSON.parse('{"a": 1}', union(Object, [Foo]).reviver)
      .a()
      .should.be.exactly(1)
  })

  it('should work with any types (no common parent class)', () => {
    const {_, string} = M.metadata()

    class Anonymous extends M.Base {
      constructor() {
        super(Anonymous)
      }

      toJSON() {
        return null
      }
    }

    class Named extends M.Base {
      constructor(props) {
        super(Named, props)
      }

      static innerTypes() {
        return {name: string()}
      }
    }

    const User = M.createUnionType([Anonymous, Named])

    const userClassifier = obj => _(obj === null ? Anonymous : Named)
    const UserAlt = M.createUnionType([Anonymous, Named], userClassifier)

    User.isAnonymous = User.caseOf([Anonymous, true], [Named, false])

    User.displayName = User.caseOf(
      [Anonymous, 'anonymous'],
      [Named, user => user.name()]
    )

    const user1 = M.fromJS(User, null)
    const user2 = M.fromJS(User, {name: 'John'})

    User.isAnonymous(user1).should.be.exactly(true)
    User.isAnonymous(user2).should.be.exactly(false)

    User.displayName(user1).should.be.exactly('anonymous')
    User.displayName(user2).should.be.exactly('John')

    const user3 = new User(Anonymous)
    const user4 = new User(Named, {name: 'John'})

    User.isAnonymous(user3).should.be.exactly(true)
    User.isAnonymous(user4).should.be.exactly(false)

    User.displayName(user3).should.be.exactly('anonymous')
    User.displayName(user4).should.be.exactly('John')

    const userAlt1 = M.fromJS(UserAlt, null)
    const userAlt2 = M.fromJS(UserAlt, {name: 'John'})

    User.isAnonymous(userAlt1).should.be.exactly(true)
    User.isAnonymous(userAlt2).should.be.exactly(false)

    User.displayName(userAlt1).should.be.exactly('anonymous')
    User.displayName(userAlt2).should.be.exactly('John')
  })

  it('should work with any types (no common parent class) (2)', () => {
    const {number} = M.metadata()

    class Circle extends M.Base {
      constructor(props) {
        super(Circle, props)
      }

      static innerTypes() {
        return {radius: number()}
      }
    }

    class Square extends M.Base {
      constructor(props) {
        super(Square, props)
      }

      static innerTypes() {
        return {side: number()}
      }
    }

    const Shape = M.createUnionType([Circle, Square])

    should(() => {
      Shape.incompleteCases = Shape.caseOf(
        [Circle, x => Math.PI * x.radius() ** 2],
        [Square, x => x.side() ** 2],
        [String, 1]
      )
    }).throw('caseOf expected 2 but contains 3')

    should(() => {
      Shape.incompleteCases = Shape.caseOf(
        [Circle, x => Math.PI * x.radius() ** 2],
        [String, 1]
      )
    }).throw('caseOf does not cover all cases')

    Shape.area = Shape.caseOf(
      [Circle, x => Math.PI * x.radius() ** 2],
      [Square, x => x.side() ** 2]
    )

    const myCircle = new Circle({radius: 1})
    const mySquare = new Square({side: 3})

    Shape.area(myCircle).should.be.exactly(Math.PI)
    Shape.area(mySquare).should.be.exactly(9)

    const myCircleAlt = M.fromJS(Shape, {radius: 1})
    const mySquareAlt = M.fromJS(Shape, {side: 3})

    Shape.area(myCircleAlt).should.be.exactly(Math.PI)
    Shape.area(mySquareAlt).should.be.exactly(9)
  })

  it('should warn about ambiguous structures and empty matches', () => {
    const {_} = M.metadata()

    class Square extends M.createModel(m => ({side: m.number()})) {
      constructor(props) {
        super(Square, props)
      }
    }

    class Hexagon extends M.createModel(m => ({side: m.number()})) {
      constructor(props) {
        super(Hexagon, props)
      }
    }

    const Shape = M.createUnionType([Square, Hexagon].map(_))

    Shape.area = Shape.caseOf(
      [Square, x => x.side() ** 2],
      [Hexagon, x => 3 * Math.sqrt(3) * x.side() ** 2 / 2]
    )

    const mySquare = new Square({side: 3})
    const myHexagon = new Hexagon({side: 3})

    Shape.area(mySquare).should.be.exactly(9)
    Shape.area(myHexagon).should.be.exactly(3 * Math.sqrt(3) * 3 ** 2 / 2)

    should(() => M.fromJS(Shape, {side: 3})).throw(
      'Ambiguous object: more than one metadata matches the object. ' +
        'A custom classifier can be passed as a second argument.'
    )

    should(() => M.fromJS(Shape, {radius: 3})).throw('Unable to infer type')
  })
}
