#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Pull requests do not affect the public Serenity/JS Handbook"
  npm run prebook:publish
  exit 0
fi

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "Building from a branch does not affect the public Serenity/JS Handbook"
  npm run prebook:publish
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  npm run book:publish
fi