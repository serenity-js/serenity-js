#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Verifying a pull request, BrowserStack is not available in this mode.";
  echo "- see https://docs.travis-ci.com/user/pull-requests#Pull-Requests-and-Security-Restrictions";

  make clean verify
  exit 0;
fi

if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  make clean verify
  exit 0;
fi
