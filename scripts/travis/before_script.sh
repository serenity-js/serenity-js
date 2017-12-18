#!/bin/bash
set -e

echo "Removing stale node_modules"
npm run lerna exec --loglevel info -- npm prune

echo "[DEBUG] list node_modules"
ls -lah node_modules/

echo "[DEBUG] list node_modules"
ls -lah packages/serenity-js/node_modules/

echo "Starting XVFB"

export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
sleep 3 # give xvfb some time to start