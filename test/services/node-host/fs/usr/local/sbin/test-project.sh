#!/bin/bash

source /usr/local/lib/node-host/pre-project-script.sh
./node_modules/.bin/mocha --opts test/mocha/test.opts
