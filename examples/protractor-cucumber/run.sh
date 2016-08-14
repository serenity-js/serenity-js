#!/usr/bin/env bash

rm -rf node_modules/serenity-bdd
rm -rf target
npm install
npm test

