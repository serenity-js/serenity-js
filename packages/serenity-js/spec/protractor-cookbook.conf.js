'use strict';
require('ts-node/register');

const
    path         = require('path'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12);

const isPullRequest = () => !! process.env.TRAVIS_PULL_REQUEST;
const canUseBrowserStack = () => !! process.env.BROWSERSTACK_USERNAME && !! process.env.BROWSERSTACK_KEY;

const shouldUseBrowserStack   = () =>   canUseBrowserStack();
const shouldUsePhantomJS      = () =>   isPullRequest();
const shouldUseRegularChrome  = () => ! isPullRequest() && ! canUseBrowserStack();
const shouldUseHeadlessChrome = () => false;  // not ready for prime time: https://bugs.chromium.org/p/chromedriver/issues/detail?id=1772#c12

console.log('[Cookbook] isPullRequest',          isPullRequest());
console.log('[Cookbook] canUseBrowserStack',     canUseBrowserStack());

console.log('[Cookbook] shouldUseBrowserStack',  shouldUseBrowserStack());
console.log('[Cookbook] shouldUsePhantomJS',     shouldUsePhantomJS());
console.log('[Cookbook] shouldUseRegularChrome', shouldUseRegularChrome());

const capabilities = () => {
    switch (true) {
        case shouldUseBrowserStack():
            console.log('[Cookbook] Using BrowserStack');
            return {
                browserName: 'chrome',
                build:   process.env.BROWSERSTACK_AUTOMATE_BUILD,
                project: process.env.BROWSERSTACK_AUTOMATE_PROJECT,

                chromeOptions: {
                    args: ['--disable-infobars']
                },

                'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
                'browserstack.local': true,
            };
        case shouldUseHeadlessChrome():
            console.log('[Cookbook] Using headless Chrome');
            return {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['--headless', '--disable-gpu', '--window-size=800,600']
                }
            };
        case shouldUsePhantomJS():
            console.log('[Cookbook] Using PhantomJS');
            return {
                'browserName': 'phantomjs',
                'phantomjs.binary.path': path.resolve(node_modules, 'phantomjs-prebuilt/lib/phantom/bin/phantomjs'),
            };
        case shouldUseRegularChrome():
        default:
            console.log('[Cookbook]: Using regular Chrome');
            return {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['--disable-infobars']
                }
            };
    }
}

exports.config = {
    seleniumServerJar: path.resolve(node_modules, 'protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar'),

    directConnect: shouldUseRegularChrome() || shouldUseHeadlessChrome(),
    framework: 'mocha',
    specs: ['cookbook/**/*.recipe.ts'],

    browserstackUser: process.env.BROWSERSTACK_USERNAME,
    browserstackKey:  process.env.BROWSERSTACK_KEY,

    restartBrowserBetweenTests: false,

    capabilities: capabilities()
};
