const
    path = require('path'),
    { DebugReporter } = require('@serenity-js/core'),
    { ChildProcessReporter } = require('@integration/testing-tools');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    allScriptsTimeout: 11000,

    specs: [ '*.spec.js', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'jasmine',
        crew: [
            new ChildProcessReporter(),
            new DebugReporter(),
        ]
    },

    jasmineNodeOpts: {
        requires: [
            path.resolve(__dirname, '../node_modules/@serenity-js/jasmine'),
        ]
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
