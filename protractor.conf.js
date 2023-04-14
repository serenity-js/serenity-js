const localChromeConfig = {
    chromeDriver: require(`chromedriver`).path,
    directConnect: true,

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts : true,

        loggingPrefs: {
            browser: 'INFO',
        },

        'goog:chromeOptions': {
            // As of version 75, ChromeDriver is W3C by default, which Protractor does not fully support.
            w3c: false,
            excludeSwitches: [ 'enable-automation' ],
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--headless',
                '--disable-gpu',
                '--window-size=1024x768',
            ]
        },
    }
}

module.exports = {

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function() {
        return browser.waitForAngularEnabled(false);
    },

    allScriptsTimeout: 120_000,

    framework: 'mocha',

    // specs: [ ],  // set in module-specific protractor.conf.js

    mochaOpts: {
        timeout: 60_000,
        require: [
            'ts-node/register',
        ],
        reporter: 'spec',
    },

    ... localChromeConfig,
};
