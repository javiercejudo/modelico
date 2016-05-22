#!/bin/bash

set -e

if [[ "$TRAVIS_NODE_VERSION" = "6" && "$SAUCE_ACCESS_KEY" ]]; then
  gulp codecov
fi
