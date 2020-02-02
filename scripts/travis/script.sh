#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Verifying a pull request, BrowserStack is not available in this mode.";
  echo "- see https://docs.travis-ci.com/user/pull-requests#Pull-Requests-and-Security-Restrictions";
fi

make clean verify report site
exit 0;
