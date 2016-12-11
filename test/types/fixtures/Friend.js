'use strict';

export default M => {
  const { _, asIs, maybe } = M.metadata;

  class Friend extends M.Base {
    constructor(fields) {
      super(Friend, fields);
    }

    static innerTypes(depth) {
      return Object.freeze({
        name: asIs(String),
        bestFriend: maybe(_(Friend, depth))
      });
    }
  }

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Maybe.EMPTY
  });

  return Object.freeze(Friend);
};
