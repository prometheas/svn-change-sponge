#!/bin/bash

cd $PROJECT_DIR
./node_modules/.bin/mocha "spec/**/*.spec.js"
