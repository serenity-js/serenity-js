#!/bin/bash
set -e

npm run coverage:publish

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Building the site to ensure there are no parse errors."
  make site

  echo "Pull requests are not released to NPM."
  exit 0
fi

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "Building the site to ensure there are no parse errors."
  make site

  echo "Builds from a branch are not released to NPM"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  echo "Releasing Serenity/JS"
  npx lerna publish --yes

  make site
  npm run site:publish
  exit 0;
fi
