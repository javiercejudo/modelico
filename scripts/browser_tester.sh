#!/bin/bash

set -e

BROWSERS=PhantomJS

if [[ "$TRAVIS_NODE_VERSION" = "14" && "$SAUCE_ACCESS_KEY" && "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  BROWSERS=$SL_BROWSERS
fi

echo -e '\nO_o Running browser tests...'
karma start --single-run --browsers $BROWSERS
