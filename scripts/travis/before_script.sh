#!/bin/bash
set -e

echo "Removing stale node_modules"
npm run lerna exec --loglevel info -- npm prune

echo "[DEBUG] list node_modules"
ls -lah node_modules/ | grep phantomjs-prebuilt
echo "[DEBUG] install tree"
sudo apt-get install tree
echo "[DEBUG] list contents of phantomjs-prebuilt"
tree node_modules/phantomjs-prebuilt

echo "Starting XVFB"

export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
sleep 3 # give xvfb some time to start