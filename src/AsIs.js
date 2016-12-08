'use strict';

import { asIsReviver } from './U';

export default Type => Object.freeze({type: Type, reviver: asIsReviver(Type)});
