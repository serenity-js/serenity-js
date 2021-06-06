const localChromeConfig = {
    chromeDriver: require(`chromedriver`).path,
    directConnect: true,

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts : true,

        loggingPrefs: {
            browser: 'INFO',
        },

        // This is needed for ChromeDriver, as of ChromeDriver 75
        // it is W3C by default. Protractor doesn't support this.
        'goog:chromeOptions':{
            w3c: false,
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--disable-infobars',
                '--headless',
                '--disable-gpu',
                '--window-size=200x100',
            ]
        },
    }
}

module.exports = {

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function() {
        return browser.waitForAngularEnabled(false);
    },

    allScriptsTimeout: 30 * 1000,

    framework: 'mocha',

    // specs: [ ],  // set in module-specific protractor.conf.js

    mochaOpts: {
        timeout: 60_000,
        require: [
            'ts-node/register',
        ],
        reporter: 'dot',
    },

    ... localChromeConfig,
};
