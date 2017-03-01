#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Pull requests do not affect the Serenity/JS Handbook"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  npm run book:publish
fi