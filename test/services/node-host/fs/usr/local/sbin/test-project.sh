#!/bin/bash

cd $PROJECT_DIR
npm install
./node_modules/.bin/mocha "test/**/*.spec.js"
