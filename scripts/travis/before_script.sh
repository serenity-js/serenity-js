#!/bin/bash
set -e

echo "Removing stale node_modules"
npm run lerna exec --loglevel info -- npm prune
