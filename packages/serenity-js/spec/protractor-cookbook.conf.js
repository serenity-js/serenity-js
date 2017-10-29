'use strict';
require('ts-node/register');

const isPullRequest = () => !!process.env.TRAVIS_PULL_REQUEST;
const canUseBrowserStack = () => !!process.env.BROWSERSTACK_USERNAME && !!process.env.BROWSERSTACK_KEY;

const shouldUseBrowserStack = () => !isPullRequest() && canUseBrowserStack();
const shouldUseHeadlessChrome = () => isPullRequest() || !canUseBrowserStack()
const shouldUseRegularChrome = () => !isPullRequest() && !canUseBrowserStack();

const capabilities = () => {
    switch (true) {
        case shouldUseBrowserStack():
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
            return {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['--headless', '--disable-gpu', '--window-size=800,600']
                }
            };
        case shouldUseRegularChrome():
        default:
            return {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['--disable-infobars']
                }
            };
    }
}

exports.config = {
    directConnect: !shouldUseBrowserStack(),
    framework: 'mocha',
    specs: ['cookbook/**/*.recipe.ts'],

    browserstackUser: process.env.BROWSERSTACK_USERNAME,
    browserstackKey:  process.env.BROWSERSTACK_KEY,

    restartBrowserBetweenTests: false,

    capabilities: capabilities()
};
