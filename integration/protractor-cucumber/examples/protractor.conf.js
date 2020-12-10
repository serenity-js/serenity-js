const
    path = require('path'),
    { StreamReporter } = require('@serenity-js/core'),
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { Actors } = require('./Actors');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    allScriptsTimeout: 11000,

    specs: [ 'features/*.feature', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'cucumber',
        actors: new Actors(),
        crew: [
            new ChildProcessReporter(),
            new StreamReporter(),
        ]
    },

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.js',
        ],
    },

    onPrepare: function() {
        return browser.waitForAngularEnabled(false);
    },

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [
                '--disable-infobars',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=1024x768',
                '--headless',
            ],
        },
    },
};
