# ES2015 proxies: accessing inner methods directly

Most built-in types in Modélico (List, Set, Map, EnumMap and Date)
are wrappers around native structures. Except for a few built-in basic
methods, it is necessary to retrieve those structures to access their
properties and methods (eg. `list.inner().reduce`).

However, if your environment
[supports ES2015 proxies](https://kangax.github.io/compat-table/es6/#test-Proxy),
Modélico provides utilities to get around this:

  - M.proxyDate
  - M.proxyList
  - M.proxySet
  - M.proxyMap, M.proxyEnumMap, M.proxyStringMap

Example:

```js
import M from 'modelico'
const p = M.proxyDate

const defaultDate = M.Date.of(new Date('1988-04-16'))
const proxiedDate = p(defaultDate)

// without proxies
defaultDate.inner().getFullYear() // => 1988

// with proxies
proxiedDate.getFullYear() // => 1988
```

Please note that native methods that modify the structure in place will
instead return a new Modélico object:

```js
// without proxies
const tmpDate = defaultDate.inner()
tmpDate.setFullYear(2000)
const defaultDate2 = M.Date.of(tmpDate)

defaultDate.inner().getFullYear()  // => 1988 (still)
defaultDate2.inner().getFullYear() // => 2000

// with proxies
const proxiedDate2 = proxiedDate.setFullYear(2000)

proxiedDate.getFullYear()  // => 1988 (still)
proxiedDate2.getFullYear() // => 2000
```

See [proxy tests](https://github.com/javiercejudo/modelico/tree/master/test/proxies)
for more details.
