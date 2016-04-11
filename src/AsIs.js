'use strict';

import U from './U';

export default type => Object.freeze({type: type, reviver: U.asIsReviver});
