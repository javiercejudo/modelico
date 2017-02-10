# ES2015 proxies

Most built-in types in Modélico (List, Set, Map, EnumMap and Date)
are wrappers around native structures. Except for a few built-in basic
methods, it is necessary to retrieve those structures to access their
properties and methods (eg. `list.inner().reduce`).

However, if your environment
[supports ES2015 proxies](https://kangax.github.io/compat-table/es6/#test-Proxy),
Modélico provides utilities to get around this:

```js
import M from 'modelico'
const p = M.proxyMap

const defaultMap = M.Map.fromObject({a: 1, b: 2, c: 3})
const proxiedMap = p(defaultMap)

// without proxies
defaultMap.inner().keys().next() // => { value: "a", done: false }

// with proxies
proxiedMap.keys().next() // => { value: "a", done: false }
```

Please note that native methods that modify the structure in place will
instead return a new modelico object:

```js
const proxiedMap2 = proxiedMap.delete('b')

proxiedMap.size  // => 3 (still)
proxiedMap2.size // => 2
```

See [proxy tests](../test/proxies) for more details.
