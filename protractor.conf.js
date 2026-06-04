const { computeExecutablePath } = require('@puppeteer/browsers')
const { resolve } = require('path')
const { existsSync, readdirSync, readFileSync } = require('fs')

// Chrome 129 is the last version that correctly supports Selenium 3
// Chrome 130 and later require Selenium 4 for browser.executeScript to correctly resolve WebElement arguments
const defaults = {
    buildId: '129.0.6668.100',
    cacheDir: resolve(__dirname, './browsers'),
};

// Debug: print resolution details to help diagnose CI path issues
const chromedriverDir = resolve(defaults.cacheDir, 'chromedriver');
const metadataPath = resolve(chromedriverDir, '.metadata');
console.log('[protractor.conf.js] @puppeteer/browsers resolved from:', require.resolve('@puppeteer/browsers'));
console.log('[protractor.conf.js] cacheDir:', defaults.cacheDir);
console.log('[protractor.conf.js] buildId:', defaults.buildId);
console.log('[protractor.conf.js] chromedriver dir exists:', existsSync(chromedriverDir));
if (existsSync(chromedriverDir)) {
    console.log('[protractor.conf.js] chromedriver dir contents:', readdirSync(chromedriverDir));
}
console.log('[protractor.conf.js] .metadata exists:', existsSync(metadataPath));
if (existsSync(metadataPath)) {
    console.log('[protractor.conf.js] .metadata contents:', readFileSync(metadataPath, 'utf8'));
}

const binaries = {
    chromedriver: computeExecutablePath({ browser: 'chromedriver', ...defaults }),
    chrome: computeExecutablePath({ browser: 'chrome', ...defaults }),
}

console.log('[protractor.conf.js] resolved chromedriver path:', binaries.chromedriver);
console.log('[protractor.conf.js] chromedriver exists:', existsSync(binaries.chromedriver));
console.log('[protractor.conf.js] resolved chrome path:', binaries.chrome);
console.log('[protractor.conf.js] chrome exists:', existsSync(binaries.chrome));

module.exports = {

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function() {
        return browser.waitForAngularEnabled(false);
    },

    allScriptsTimeout: 120_000,

    // specs: [ ],  // set in module-specific protractor.conf.js files

    framework: 'mocha',
    mochaOpts: {
        timeout: 60_000,
        // ts-node is already loaded by nyc when protractor is executed via npm test
        require: [
            'ts-node/register',
        ],
        reporter: 'spec',
    },


    directConnect: true,

    chromeDriver: binaries.chromedriver,

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts : true,

        loggingPrefs: {
            browser: 'INFO',
        },

        'goog:chromeOptions': {
            // As of version 75, ChromeDriver is W3C by default, which Protractor does not fully support.
            w3c: false,
            binary: binaries.chrome,
            excludeSwitches: [ 'enable-automation' ],
            args: [
                'no-sandbox',
                'disable-web-security',
                'allow-file-access-from-files',
                'allow-file-access',
                'headless',
                'disable-gpu',
                'window-size=1024x768',
            ]
        },
    },
};
