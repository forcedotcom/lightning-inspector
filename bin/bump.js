#!/usr/bin/env node
const bump = require('json-bump');
bump('package.json', { patch: 1, spaces: 2 });
bump('manifest.json', { patch: 1, spaces: 2 });