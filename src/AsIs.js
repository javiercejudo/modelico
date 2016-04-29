'use strict';

import U from './U';

export default Type => Object.freeze({type: Type, reviver: U.asIsReviver});
