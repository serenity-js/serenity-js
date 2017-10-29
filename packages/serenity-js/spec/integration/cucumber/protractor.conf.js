'use strict';
require('ts-node/register');

var path         = require('path'),
    crew         = require('../../support/child_process_reporter.ts');

exports.config = {
    directConnect: true,
    framework: 'custom',

    frameworkPath: path.resolve(__dirname, '../../../src'),
    serenity: {
        dialect: 'cucumber',
        crew: [ crew.childProcessReporter() ],
    },

    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require:    [
            'features/**/*.ts'
        ],
        format:     'pretty',
        compiler:   'ts:ts-node/register',
    },

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
        }
    },
};
