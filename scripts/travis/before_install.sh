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

  # https://github.com/atlassian/lerna-semantic-release/blob/06e18185c6477085b7046248e7dd7eb59c06e0c9/.travis/before_install.sh

  git config credential.helper store
  echo "https://${RELEASE_GH_USERNAME}:${RELEASE_GH_TOKEN}@github.com/atlassian/lerna-semantic-release.git" > ~/.git-credentials

  npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN -q

  git config --global user.email $RELEASE_GH_EMAIL
  git config --global user.name $RELEASE_GH_USERNAME
  git config --global push.default simple

  git fetch --tags
  git branch -u origin/$TRAVIS_BRANCH
  git fsck --full #debug
  echo "npm whoami"
  npm whoami #debug
  echo "git config --list"
  git config --list #debug

  exit 0
fi