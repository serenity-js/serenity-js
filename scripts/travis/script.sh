#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Verifying a pull request, BrowserStack is not available in this mode.";
  echo "- see https://docs.travis-ci.com/user/pull-requests#Pull-Requests-and-Security-Restrictions";

  npm run verify:pull-request;
  exit 0;
fi

if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  npm run verify;
  exit 0;
fi
