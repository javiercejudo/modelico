Modélico \[moˈðe.li.ko\] is a universal-JS library for serialisable immutable
models.

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg?branch=master)](https://travis-ci.org/javiercejudo/modelico)
[![codecov.io](https://codecov.io/github/javiercejudo/modelico/coverage.svg?branch=master)](https://codecov.io/github/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)
[![Dependency Status](https://gemnasium.com/badges/github.com/javiercejudo/modelico.svg)](https://gemnasium.com/github.com/javiercejudo/modelico)

## How is this different from Modélico?

Modélico models are immutable, but are implemented with native structures, eg.
the normal `M.Map` is implemented with JavaScript's native `Map`, while the `M.Map`
is implemented with `Immutable.OrderedMap`. The same goes for `M.Set` and `M.List`.

**Docs: https://modelico.javiercejudo.com/docs/introduction/**

## Installation

    npm i modelico

To use it in the browser, grab the
[minified](https://raw.githubusercontent.com/javiercejudo/modelico/master/dist/modelico.min.js)
or the
[development](https://raw.githubusercontent.com/javiercejudo/modelico/master/dist/modelico.js)
files.

[Run the current tests](https://rawgit.com/javiercejudo/modelico/master/test/browser/index.html)
directly on your target browsers to make sure things work as expected.

*Note: [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) might be
required for browsers other than Chrome, Firefox and Edge.*

## Browser support

[![Build Status](https://saucelabs.com/browser-matrix/modelico.svg)](https://saucelabs.com/u/modelico)

## Acknowledgments :bow:

Inspired by [Immutable.js](https://github.com/facebook/immutable-js),
[Gson](https://github.com/google/gson) and initially designed to cover
the same use cases as an internal Skiddoo tool by
[Jaie Wilson](https://github.com/jaiew).
