'use strict';

require('ts-node/register');    // because of the child_process_reporter.ts

let path         = require('path'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12),
    crew         = require('../../support/child_process_reporter.ts');

exports.config = {
    directConnect: true,
    framework: 'custom',

    frameworkPath: path.resolve(__dirname, '../../../src'),
    serenity: {
        dialect: 'mocha',
        crew: [ crew.childProcessReporter() ],
    },

    specs: [ 'spec/**.ts' ],

    mochaOpts: {
        ui: 'bdd',
        compiler: 'ts:ts-node/register',
    },

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
        }
    }
};
