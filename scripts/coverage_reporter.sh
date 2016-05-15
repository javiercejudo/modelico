#!/bin/bash

set -e

if [[ "$TRAVIS_NODE_VERSION" = "stable" && "$SAUCE_ACCESS_KEY" ]]; then
  gulp codecov
fi
