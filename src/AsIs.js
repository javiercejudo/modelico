'use strict';

import { asIsReviver } from './U';

export const AsIsWithOptions = (options, Type) => Object.freeze({
  type: Type,
  reviver: asIsReviver,
  options
});

export default Type => AsIsWithOptions({}, Type);
