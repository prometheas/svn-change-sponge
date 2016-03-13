#!/bin/bash

cd $PROJECT_DIR
./node_modules/.bin/mocha "test/**/*.spec.js"
