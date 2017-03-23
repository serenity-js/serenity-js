const ArgvParser = require('cucumber/lib/cli/argv_parser');
const parsed = ArgvParser.default.parse(process.argv);

require('ts-node/register');

require('./adapter.ts')(parsed);
