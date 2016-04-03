#!/bin/bash

set -e

BROWSERS=PhantomJS

if [[ "$TRAVIS_NODE_VERSION" = "stable" && "$SAUCE_ACCESS_KEY" ]]; then
  BROWSERS=$SL_BROWSERS
fi

echo -e '\nO_o Browser tests'
echo -e '\nO_o Preparing...'

npm run build
npm run build-browser-spec

echo -e '\nO_o Running browser tests...'
karma start --single-run --browsers $BROWSERS
