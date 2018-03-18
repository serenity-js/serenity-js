'use strict';
require('ts-node/register');

const isCI = require('./isCI');

exports.config = {
    directConnect: true,
    framework: 'mocha',
    specs: ['cookbook/**/*.recipe.ts'],

    restartBrowserBetweenTests: false,

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
                .concat(isCI() ? ['--no-sandbox'] : [])
        }
    }
};
