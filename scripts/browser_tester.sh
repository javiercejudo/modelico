#!/bin/bash

set -e

BROWSERS=PhantomJS
LEGACY_IE_BROWSERS=$BROWSERS

if [[ "$TRAVIS_NODE_VERSION" = "6" && "$SAUCE_ACCESS_KEY" && "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  BROWSERS=$SL_BROWSERS
  LEGACY_IE_BROWSERS=$SL_LEGACY_IE_BROWSERS
fi

echo -e '\nO_o Running browser tests...'
ENTRY="index.js" karma start --single-run --browsers $BROWSERS
ENTRY="ie9_10.js" karma start --single-run --browsers $LEGACY_IE_BROWSERS
