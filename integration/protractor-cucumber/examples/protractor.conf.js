const { Actors } = require('./Actors');

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
        // don't register the crew in here to allow for a native cucumber reporter test register a custom formatter
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
