const path = require('path');
const { default: reporter } = require('@serenity-js/jasmine');

jasmine.getEnv().addReporter(reporter({ specDirectory: path.resolve(__dirname, '../examples') }));
