/* eslint-env mocha */

export default ({shuffle}, should, M, fixtures, {Ajv}) => () => {
  const defaultCmp = (a, b) => (a === b ? 0 : a > b ? 1 : -1)

  const binaryTreeFactory = (valueMetadata, {cmp = defaultCmp, ajv} = {}) => {
    const {_, base, ajvBase, ajvUnion} = M.ajvMetadata(ajv)

    const objClassifier = obj => _(obj === null ? Empty : Node)
    const insertReducer = (acc, x) => acc.insert(x)

    class Tree extends M.Base {
      static fromArray(arr) {
        return arr.reduce(insertReducer, empty)
      }

      static metadata() {
        return ajvUnion(Tree, [Empty, Node], objClassifier)
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

      fold(f, init) {
        return init
      }

      has(x) {
        return false
      }

      map(f) {
        return this
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

      arr.sort(cmp)

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
        const v = this.value()
        const comparison = cmp(x, v)

        if (comparison === 0) {
          return this
        }

        return comparison === 1
          ? this.set('right', this.right().insert(x))
          : this.set('left', this.left().insert(x))
      }

      fold(f, init) {
        const vInit = f(this.value(), init)
        const lInit = this.left().fold(f, vInit)

        return this.right().fold(f, lInit)
      }

      has(x) {
        if (cmp(x, this.value()) === 0) {
          return true
        }

        return this.left().has(x) || this.right().has(x)
      }

      map(f) {
        return Node.of(f(this.value()), this.left().map(f), this.right().map(f))
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

  const numberTree = binaryTreeFactory(ajvNumber(), {ajv})
  const stringTree = binaryTreeFactory(ajvString(), {ajv})

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

  it('.has()', () => {
    const {Node} = numberTree

    const myTree = Node.of(2, Node.of(1), Node.of(3))

    myTree.has(1).should.be.exactly(true)
    myTree.has(2).should.be.exactly(true)
    myTree.has(3).should.be.exactly(true)

    myTree.has(0).should.be.exactly(false)
    myTree.has(4).should.be.exactly(false)
  })

  it('.fold()', () => {
    const {Tree} = numberTree

    const myTree = Tree.fromArray([4, 2, 1, 3, 6, 5, 7])
    const add = (a, b) => a + b

    myTree.fold(add, 0).should.be.exactly(28)
  })

  it('.map()', () => {
    const {Node} = numberTree

    const myTree = Node.of(2, Node.of(1), Node.of(3))
    const myMappedTree = myTree.map(x => x ** 2)

    myMappedTree.value().should.be.exactly(4)
    myMappedTree.left().value().should.be.exactly(1)
    myMappedTree.right().value().should.be.exactly(9)

    myTree.depth().should.be.exactly(2)
    myMappedTree.depth().should.be.exactly(2)

    const myConstantTree = myTree.map(() => 1)

    myConstantTree.value().should.be.exactly(1)
    myConstantTree.left().value().should.be.exactly(1)
    myConstantTree.right().value().should.be.exactly(1)

    const myBalancedConstantTree = myConstantTree.balance()

    myBalancedConstantTree.depth().should.be.exactly(1)
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

  it('balance larger tree', () => {
    const {Tree} = numberTree
    const power = 6

    const values = Array(2 ** power - 1).fill().map((_, i) => i)
    const arr = shuffle(values)

    const largeTree = Tree.fromArray(arr)
    const balancedTree = largeTree.balance()

    const depth = largeTree.depth()
    const balancedDepth = balancedTree.depth()

    balancedDepth.should.be.lessThan(depth).and.be.exactly(power)
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

  it('schema: Tree<Animal>', () => {
    const ajv = Ajv()
    const {ajvString} = M.ajvMetadata(ajv)

    class Animal extends M.Base {
      constructor(props) {
        super(Animal, props)
      }

      static innerTypes() {
        return Object.freeze({
          name: ajvString({minLength: 1, maxLength: 25})
        })
      }
    }

    const baseCmp = (a, b) => (a === b ? 0 : a > b ? 1 : -1)
    const cmp = (a, b) => baseCmp(a.name(), b.name())

    const {Tree} = binaryTreeFactory(_(Animal), {cmp, ajv})

    const bane = new Animal({name: 'Bane'})
    const robbie = new Animal({name: 'Robbie'})
    const sunny = new Animal({name: 'Sunny'})

    const myTree = Tree.fromArray([bane, robbie, sunny])

    myTree.toJS().should.deepEqual({
      value: {
        name: 'Bane'
      },
      left: null,
      right: {
        value: {
          name: 'Robbie'
        },
        left: null,
        right: {
          value: {
            name: 'Sunny'
          },
          left: null,
          right: null
        }
      }
    })

    myTree.balance().toJS().should.deepEqual({
      value: {
        name: 'Robbie'
      },
      left: {
        value: {
          name: 'Bane'
        },
        left: null,
        right: null
      },
      right: {
        value: {
          name: 'Sunny'
        },
        left: null,
        right: null
      }
    })

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
              $ref: '#/definitions/5'
            },
            left: {
              $ref: '#/definitions/1'
            },
            right: {
              $ref: '#/definitions/1'
            }
          },
          required: ['value', 'left', 'right']
        },
        '5': {
          type: 'object',
          properties: {
            name: {
              $ref: '#/definitions/6'
            }
          },
          required: ['name']
        },
        '6': {
          type: 'string',
          minLength: 1,
          maxLength: 25
        }
      },
      $ref: '#/definitions/1'
    })
  })
}
