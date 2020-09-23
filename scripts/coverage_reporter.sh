#!/bin/bash

set -e

if [[ "$TRAVIS_NODE_VERSION" = "14" && "$SAUCE_ACCESS_KEY" ]]; then
  npm run codecov
fi
