#!/bin/bash
set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo "Building a pull request"
  exit 0
fi

if [[ $TRAVIS_BRANCH == '2.0' ]]; then
  # clone the repository again so that we have access to branches and tags
  # - https://stackoverflow.com/questions/32580821/how-can-i-customize-override-the-git-clone-step-in-travis-ci
  # - https://github.com/atlassian/lerna-semantic-release/blob/06e18185c6477085b7046248e7dd7eb59c06e0c9/.travis/before_install.sh
  # todo: there has to be a more elegant way to do this ...
  echo "Building from 2.0"

  rm -rf .git
  git init
  git clean -dfx
  git remote add origin https://github.com/jan-molak/serenity-js.git
  git fetch origin
  git clone https://github.com/$TRAVIS_REPO_SLUG.git $TRAVIS_REPO_SLUG
  git checkout $TRAVIS_BRANCH

  git config credential.helper store
  echo "https://${RELEASE_GH_USERNAME}:${RELEASE_GH_TOKEN}@github.com/jan-molak/serenity-js.git" > ~/.git-credentials

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

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "Building from $TRAVIS_BRANCH branch"
  exit 0
fi

if [[ $TRAVIS_BRANCH == 'master' ]]; then
  echo "Building from master"

  # https://github.com/atlassian/lerna-semantic-release/blob/06e18185c6477085b7046248e7dd7eb59c06e0c9/.travis/before_install.sh

  rm -rf .git
  git init
  git clean -dfx
  git remote add origin https://github.com/jan-molak/serenity-js.git
  git fetch origin
  git clone https://github.com/$TRAVIS_REPO_SLUG.git $TRAVIS_REPO_SLUG
  git checkout $TRAVIS_BRANCH

  git config credential.helper store
  echo "https://${RELEASE_GH_USERNAME}:${RELEASE_GH_TOKEN}@github.com/jan-molak/serenity-js.git" > ~/.git-credentials

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