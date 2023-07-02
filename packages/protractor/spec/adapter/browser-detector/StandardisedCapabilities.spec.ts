import { expect } from '@integration/testing-tools';
import { describe } from 'mocha';
import { given } from 'mocha-testdata';
import type { ProtractorBrowser } from 'protractor';
import { Capabilities } from 'protractor';

import { StandardisedCapabilities } from '../../../src/adapter/browser-detector';

describe('StandardisedCapabilities', () => {

    given([
        {
            description: 'Edge on Windows',
            actual: { browserName: 'MicrosoftEdge', browserVersion: '42.17134.1.0', platformName: 'windows', platform: 'WINDOWS', platformVersion: '10' },
            expected: { browserName: 'MicrosoftEdge', browserVersion: '42.17134.1.0', platformName: 'windows', platformVersion: '10' },
        }, {
            description: 'Chrome on Windows',
            actual: { browserName: 'chrome', version: '79.0.3945.79', platform: 'WINDOWS' },
            expected: { browserName: 'chrome', browserVersion: '79.0.3945.79', platformName: 'WINDOWS' },
        }, {
            description: 'Edge on Mac',
            actual: { browserName: 'MicrosoftEdge', version: '79.0.309.18', platform: 'Mac OS X' },
            expected: { browserName: 'MicrosoftEdge', browserVersion: '79.0.309.18', platformName: 'Mac OS X' },
        }, {
            description: 'Firefox on Windows',
            actual: { browserName: 'firefox', browserVersion: '72.0', platformName: 'windows', platformVersion: '6.1' },
            expected: { browserName: 'firefox', browserVersion: '72.0', platformName: 'windows', platformVersion: '6.1' },
        }, {
            description: 'IE 10 on Windows',
            actual: { browserName: 'internet explorer', version: '10', platform: 'WINDOWS' },
            expected: { browserName: 'internet explorer', browserVersion: '10', platformName: 'WINDOWS' },
        }, {
            description: 'Chrome on Mac',
            actual: { browserName: 'chrome', version: '79.0.3945.79', platform: 'MAC' },
            expected: { browserName: 'chrome', browserVersion: '79.0.3945.79', platformName: 'MAC' },
        }, {
            description: 'Chrome (mobile) on Android (Samsung SM-G950F)',
            actual: { browserName: 'chrome', deviceManufacturer: 'samsung', deviceModel: 'SM-G950F', platformName: 'Android', platform: 'LINUX', platformVersion: '7.0' },
            expected: { browserName: 'chrome', browserVersion: 'samsung SM-G950F', platformName: 'Android', platformVersion: '7.0' },
        }, {
            description: 'Opera on Windows',
            actual: { browserName: 'opera', version: '12.16', platformName: 'ANY', platform: 'WINDOWS' },
            expected: { browserName: 'opera', browserVersion: '12.16', platformName: 'WINDOWS' },
        }, {
            description: 'Firefox on Mac',
            actual: { browserName: 'firefox', browserVersion: '72.0', platformName: 'mac', platformVersion: '13.4.0' },
            expected: { browserName: 'firefox', browserVersion: '72.0', platformName: 'mac', platformVersion: '13.4.0' },
        }, {
            description: 'Safari (mobile) on iPhone 7',
            actual: {
                browserName: 'safari',
                version: '',
                mobile: { browser: 'mobile', version: 'iPhone 7-10.3' },
                platformName: 'iOS',
                platform: 'MAC',
                platformVersion: '11.0',
            },
            expected: { browserName: 'safari', browserVersion: 'iPhone 7-10.3', platformName: 'iOS', platformVersion: '11.0' },
        }, {
            description: 'Opera on Mac',
            actual: { browserName: 'opera', version: '12.15', platformName: 'ANY', platform: 'MAC' },
            expected: { browserName: 'opera', browserVersion: '12.15', platformName: 'MAC' },
        }, {
            description: 'Chrome (mobile) on Android (Motorola XT1092)',
            actual: { browserName: 'chrome', deviceManufacturer: 'motorola', deviceModel: 'XT1092', platformName: 'Android', platform: 'LINUX', platformVersion: '6.0' },
            expected: { browserName: 'chrome', browserVersion: 'motorola XT1092', platformName: 'Android', platformVersion: '6.0' },
        }, {
            description: 'Safari (mobile) on iPhone 8 Plus',
            actual: {
                browserName: 'safari',
                version: '',
                mobile: { browser: 'mobile', version: 'iPhone 8 Plus-11.0' },
                platformName: 'iOS',
                platform: 'MAC',
                platformVersion: '11.0',
            },
            expected: { browserName: 'safari', browserVersion: 'iPhone 8 Plus-11.0', platformName: 'iOS', platformVersion: '11.0' },
        }, {
            description: 'Safari on Mac',
            actual: { browserName: 'safari', version: '7.1.8', platform: 'MAC' },
            expected: { browserName: 'safari', browserVersion: '7.1.8', platformName: 'MAC' },
        }, {
            description: 'IE 6 on Windows',
            actual: { browserName: 'internet explorer', version: '6', platform: 'WINDOWS' },
            expected: { browserName: 'internet explorer', browserVersion: '6', platformName: 'WINDOWS' },
        }, {
            description: 'Chrome (mobile emulation) on Mac OS X',
            actual: {
                browserName: 'chrome', version: '80.0.3987.87', browserVersion: undefined,
                deviceManufacturer: undefined, deviceModel: undefined, mobile: undefined, mobileEmulationEnabled: true,
                platformName: undefined, platform: 'Mac OS X', platformVersion: undefined,
            },
            expected: {
                browserName: 'chrome', browserVersion: '80.0.3987.87 (mobile emulation)', platformName: 'Mac OS X',
            },
        },
    ]).
    it(`standardises the WebDriver capabilities across browsers and platforms`, ({ actual, expected }) => {
        const fakeBrowser = {
            getCapabilities: () => Promise.resolve(new Capabilities(actual)),
        };

        const capabilities = StandardisedCapabilities.of(() => fakeBrowser as unknown as ProtractorBrowser);

        return Promise.all([
            expect(capabilities.browserName()).to.eventually.equal(expected.browserName),
            expect(capabilities.browserVersion()).to.eventually.equal(expected.browserVersion),
            expect(capabilities.platformName()).to.eventually.equal(expected.platformName),
            expect(capabilities.platformVersion()).to.eventually.equal(expected.platformVersion),
        ]);
    });
});
