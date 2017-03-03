#!/bin/bash
set -e

echo "Installing NPM";
npm i -g npm@^3.0.0

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Building a pull request"
  exit 0
fi

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "Building from $TRAVIS_BRANCH branch"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  echo "Building from master"
  exit 0
fi