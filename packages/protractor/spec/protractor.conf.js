exports.config = {
    chromeDriver: require(`chromedriver/lib/chromedriver`).path,

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function() {
        return browser.waitForAngularEnabled(false);
    },

    directConnect: true,

    allScriptsTimeout: 10 * 1000,

    framework: 'mocha',

    specs: [ '**/*.spec.ts' ],

    mochaOpts: {
        require: [
            'ts-node/register',
        ],
        reporter: 'dot',
    },

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts : true,

        loggingPrefs: {
            browser: 'INFO',
        },

        chromeOptions: {
            args: [
                '--disable-infobars',
                '--headless',
                '--disable-gpu',
                '--window-size=200x100',
            ]
        }
    }
};
