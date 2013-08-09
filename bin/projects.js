#!/usr/bin/env node

var helmsman = require('../../node-helmsman');

var program = helmsman({ usePath: true });

program.parse();
