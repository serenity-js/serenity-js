#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Pull requests are not released to NPM."
  exit 0
fi

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "Builds from a branch are not released to NPM"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  npm run semantic-release-dry-run

  echo "[DEBUG] CHANGELOG"
  cat packages/*/CHANGELOG.md

  # npm run semantic-release
  # npm run lerna exec --loglevel info -- npm run coverage:publish
fi
