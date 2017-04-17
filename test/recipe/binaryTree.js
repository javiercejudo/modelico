/* eslint-env mocha */

export default (should, M, fixtures, {Ajv}) => () => {
  const binaryTreeFactory = (valueMetadata, ajv) => {
    const {_, base, ajvMeta, ajvBase} = M.ajvMetadata(ajv)

    const treeReviver = (k, obj, path = []) => {
      if (k !== '') {
        return obj
      }

      const subType = obj === null ? Empty : Node

      return _(subType).reviver(k, obj, path)
    }

    const insertReducer = (acc, x) => acc.insert(x)

    class Tree extends M.Base {
      static fromArray(arr) {
        return arr.reduce(insertReducer, empty)
      }

      static metadata() {
        const baseMetadata = Object.assign({}, {reviver: treeReviver})

        return ajvMeta(baseMetadata, {}, {}, () => ({
          anyOf: [Empty, Node].map(x => M.getSchema(_(x), false))
        }))
      }
    }

    let empty
    class Empty extends Tree {
      constructor() {
        super(Empty)

        if (!empty) {
          empty = this
        }

        return empty
      }

      isEmpty() {
        return true
      }

      depth() {
        return 0
      }

      insert(x) {
        return Node.of(x)
      }

      toArray() {
        return []
      }

      balance() {
        return this
      }

      invert() {
        return this
      }

      toJSON() {
        return null
      }

      static metadata() {
        return ajvBase(Empty, {type: 'null'})
      }
    }

    const balanceArray = arr => {
      const length = arr.length

      if (length <= 2) {
        return arr
      }

      arr.sort()

      const centre = Math.floor(length / 2)
      const v = arr[centre]
      const leftArr = arr.slice(0, centre)
      const rightArr = arr.slice(centre + 1)

      return [v, ...balanceArray(leftArr), ...balanceArray(rightArr)]
    }

    class Node extends Tree {
      constructor(props = {}) {
        const {value = 0, left = empty, right = empty} = props
        super(Node, {value, left, right})
      }

      isEmpty() {
        return false
      }

      depth() {
        return 1 + Math.max(this.left().depth(), this.right().depth())
      }

      insert(x) {
        const y = this.value()

        if (x === y) {
          return this
        }

        return x > y
          ? this.set('right', this.right().insert(x))
          : this.set('left', this.left().insert(x))
      }

      toArray() {
        return [
          this.value(),
          ...this.left().toArray(),
          ...this.right().toArray()
        ]
      }

      balance() {
        return Tree.fromArray(balanceArray(this.toArray()))
      }

      invert() {
        return this.copy({
          left: this.right().invert(),
          right: this.left().invert()
        })
      }

      static of(value, left, right) {
        return new Node({value, left, right})
      }

      static innerTypes() {
        return Object.freeze({
          value: valueMetadata,
          left: _(Tree),
          right: _(Tree)
        })
      }

      static metadata() {
        return base(Node)
      }
    }

    return Object.freeze({
      empty: new Empty(),
      Node,
      Tree
    })
  }

  // ============================================================

  const ajv = Ajv()
  const {_, ajvNumber, ajvString} = M.ajvMetadata(ajv)

  const numberTree = binaryTreeFactory(ajvNumber(), ajv)
  const stringTree = binaryTreeFactory(ajvString(), ajv)

  it('Node.of() / empty / serialisation', () => {
    const {empty, Node, Tree} = numberTree

    const myTree1 = Node.of(4, empty, Node.of(6))

    const expected = {
      value: 4,
      left: null,
      right: {
        value: 6,
        left: null,
        right: null
      }
    }

    myTree1.toJS().should.deepEqual(expected)

    const myTree2 = M.fromJS(Tree, {
      value: 4,
      left: null,
      right: {
        value: 6,
        left: null,
        right: null
      }
    })

    myTree2.right().value().should.be.exactly(6)
    myTree2.right().right().should.be.exactly(empty)

    const myTree3 = myTree2.insert(3).insert(10)

    myTree3.toJS().should.deepEqual({
      value: 4,
      left: {
        value: 3,
        left: null,
        right: null
      },
      right: {
        value: 6,
        left: null,
        right: {
          value: 10,
          left: null,
          right: null
        }
      }
    })
  })

  it('Tree.fromArray() / .toArray() / .depth()', () => {
    const {Tree} = numberTree

    const deepTree = Tree.fromArray([1, 2, 3, 4, 5, 6, 7])
    const niceTree = Tree.fromArray([4, 2, 1, 3, 6, 5, 7])

    deepTree.depth().should.be.exactly(7)
    niceTree.depth().should.be.exactly(3)

    deepTree.toArray().should.eql([1, 2, 3, 4, 5, 6, 7])
    niceTree.toArray().should.eql([4, 2, 1, 3, 6, 5, 7])

    deepTree.toJS().should.deepEqual({
      value: 1,
      left: null,
      right: {
        value: 2,
        left: null,
        right: {
          value: 3,
          left: null,
          right: {
            value: 4,
            left: null,
            right: {
              value: 5,
              left: null,
              right: {
                value: 6,
                left: null,
                right: {
                  value: 7,
                  left: null,
                  right: null
                }
              }
            }
          }
        }
      }
    })

    niceTree.toJS().should.deepEqual({
      value: 4,
      left: {
        value: 2,
        left: {
          value: 1,
          left: null,
          right: null
        },
        right: {
          value: 3,
          left: null,
          right: null
        }
      },
      right: {
        value: 6,
        left: {
          value: 5,
          left: null,
          right: null
        },
        right: {
          value: 7,
          left: null,
          right: null
        }
      }
    })
  })

  it('.balance()', () => {
    const {Tree} = numberTree

    const deepTree = Tree.fromArray([1, 2, 3, 4, 5, 6, 7])
    const niceTree = Tree.fromArray([4, 2, 1, 3, 6, 5, 7])

    deepTree.balance().toJS().should.deepEqual(niceTree.toJS())
  })

  it('.invert()', () => {
    const {Node} = numberTree

    const myTree4 = Node.of(
      4,
      Node.of(2, Node.of(1), Node.of(3)),
      Node.of(7, Node.of(6), Node.of(9))
    )

    const myInvertedTree4 = myTree4.invert()

    myTree4.toJS().should.deepEqual({
      value: 4,
      left: {
        value: 2,
        left: {
          value: 1,
          left: null,
          right: null
        },
        right: {
          value: 3,
          left: null,
          right: null
        }
      },
      right: {
        value: 7,
        left: {
          value: 6,
          left: null,
          right: null
        },
        right: {
          value: 9,
          left: null,
          right: null
        }
      }
    })

    myInvertedTree4.toJS().should.deepEqual({
      value: 4,
      left: {
        value: 7,
        left: {
          value: 9,
          left: null,
          right: null
        },
        right: {
          value: 6,
          left: null,
          right: null
        }
      },
      right: {
        value: 2,
        left: {
          value: 3,
          left: null,
          right: null
        },
        right: {
          value: 1,
          left: null,
          right: null
        }
      }
    })
  })

  it('schema: Tree<number>', () => {
    const {Tree} = numberTree

    M.getSchema(_(Tree)).should.deepEqual({
      definitions: {
        '1': {
          anyOf: [
            {
              type: 'null'
            },
            {
              $ref: '#/definitions/4'
            }
          ]
        },
        '4': {
          type: 'object',
          properties: {
            value: {
              type: 'number'
            },
            left: {
              $ref: '#/definitions/1'
            },
            right: {
              $ref: '#/definitions/1'
            }
          },
          required: ['value', 'left', 'right']
        }
      },
      $ref: '#/definitions/1'
    })
  })

  it('schema: Tree<string>', () => {
    const {Tree} = stringTree

    M.getSchema(_(Tree)).should.deepEqual({
      definitions: {
        '1': {
          anyOf: [
            {
              type: 'null'
            },
            {
              $ref: '#/definitions/4'
            }
          ]
        },
        '4': {
          type: 'object',
          properties: {
            value: {
              type: 'string'
            },
            left: {
              $ref: '#/definitions/1'
            },
            right: {
              $ref: '#/definitions/1'
            }
          },
          required: ['value', 'left', 'right']
        }
      },
      $ref: '#/definitions/1'
    })
  })
}
