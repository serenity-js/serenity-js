#!/usr/bin/env node

import { bootstrap } from './bootstrap.mjs';

// When invoked via `pnpm run report:html -- aggregate ...`, pnpm inserts
// a `--` separator that breaks yargs command parsing. Strip it.
const argv = process.argv.slice(2);
const cleanArgv = argv[0] === '--' ? argv.slice(1) : argv;

bootstrap(cleanArgv);
