/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  const reviver = (k, v) => Point.of(...v.split(','))

  class Point extends M.Base {
    constructor(props) {
      super(props)

      this.x = () => props.x
      this.y = () => props.y
    }

    distanceTo(point) {
      const {x: x1, y: y1} = this
      const {x: x2, y: y2} = point

      return Math.sqrt((x2() - x1()) ** 2 + (y2() - y1()) ** 2)
    }

    toJSON() {
      return `${this.x()},${this.y()}`
    }

    static of(x, y) {
      return new Point({x, y})
    }

    static metadata() {
      return Object.freeze({type: Point, reviver})
    }
  }

  it('support custom serialisation', () => {
    const pointA = M.fromJSON(Point, '"2,3"')
    const pointB = Point.of(3, 4)

    pointA.distanceTo(pointB).should.be.exactly(Math.SQRT2)

    JSON.stringify(pointB).should.be.exactly('"3,4"')
  })
}
