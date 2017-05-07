/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  const reviver = (k, v) => new Point(...v.split(','))

  class Point extends M.Base {
    constructor(x, y) {
      super(Point, {x, y})

      this.x = () => x
      this.y = () => y
    }

    distanceTo(point) {
      const {x: x1, y: y1} = this
      const {x: x2, y: y2} = point

      return Math.sqrt((x2() - x1()) ** 2 + (y2() - y1()) ** 2)
    }

    toJSON() {
      return `${this.x()},${this.y()}`
    }

    static metadata() {
      return Object.freeze({type: Point, reviver})
    }
  }

  it('support custom serialisation', () => {
    const pointA = M.fromJSON(Point, '"2,3"')
    const pointB = new Point(3, 4)

    pointA.distanceTo(pointB).should.be.exactly(Math.SQRT2)

    JSON.stringify(pointB).should.be.exactly('"3,4"')
  })
}
