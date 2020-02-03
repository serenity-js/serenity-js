#!/bin/bash
set -e

npm run coverage:publish

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Pull requests are not released to NPM."
  exit 0
fi

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "Builds from a branch are not released to NPM"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  echo "Releasing 2.0 alpha"
  npx lerna publish --yes
  npm run site:publish
  exit 0;
fi
