'use strict';

import { identity } from './U';

const Any = x => identity(x);

// Any.name = 'Any';

export default Object.freeze(Any);
