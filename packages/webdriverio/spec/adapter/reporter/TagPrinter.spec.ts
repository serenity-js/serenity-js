import { expect } from '@integration/testing-tools';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model/index.js';
import { beforeEach, describe, it } from 'mocha';

import { TagPrinter } from '../../../src/adapter/reporter/index.js';

describe('TagPrinter', () => {

    let tagPrinter: TagPrinter;

    beforeEach(() => {
        tagPrinter = new TagPrinter();
    });

    describe('when working with a mobile device', () => {

        it('should tag browser and platform for mobile web browser', () => {
            const tags = tagPrinter.tagsFor({
                deviceName:                 'iPhone 6 Plus',
                ['appium:platformName']:    'iOS',
                ['appium:platformVersion']: '9.2',
                browserName:                'Safari',
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('Safari', 'iPhone 6 Plus'));
            expect(tags[1]).to.equal(new PlatformTag('iOS', '9.2'));
        });

        it('should mark browser as "unknown" when information is missing', () => {
            const tags = tagPrinter.tagsFor({
                deviceName:                 'iPhone 6 Plus',
                ['appium:platformName']:    'iOS',
                ['appium:platformVersion']: '9.2',
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('unknown', 'iPhone 6 Plus'));
            expect(tags[1]).to.equal(new PlatformTag('iOS', '9.2'));
        });

        it('should tag the native app as "browser"', () => {
            const tags = tagPrinter.tagsFor({
                deviceName:                 'iPhone 6 Plus',
                ['appium:platformName']:    'iOS',
                ['appium:platformVersion']: '9.2',
                ['appium:app']:             'sauce-storage:myApp.app',
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('myApp.app', 'iPhone 6 Plus'));
            expect(tags[1]).to.equal(new PlatformTag('iOS', '9.2'));
        });

        it('should tag a simulator', () => {
            // https://appium.io/docs/en/writing-running-appium/caps/
            const tags = tagPrinter.tagsFor({
                ['appium:automationName']: 'XCUITest',
                browserName: 'Safari',
                deviceName: 'iPhone Simulator',
                platformName: 'iOS',
                ['appium:platformVersion']: undefined,
                ['appium:udid']: undefined,
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('Safari', 'iPhone Simulator'));
            expect(tags[1]).to.equal(new PlatformTag('iOS'));
        });
    })

    describe('when working with a single browser', () => {

        it('should tag "platform" as unknown where the information is missing', () => {
            const tags = tagPrinter.tagsFor({
                browserName:    'chrome',
                version:        '50',
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('chrome', '50'));
            expect(tags[1]).to.equal(new PlatformTag('unknown'));
        });

        it('should tag both browser and platform, where platformVersion is not available', () => {
            const tags = tagPrinter.tagsFor({
                browserName:    'chrome',
                version:        '50',
                platform:       'Windows 8.1'
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('chrome', '50'));
            expect(tags[1]).to.equal(new PlatformTag('Windows 8.1'));
        });

        it('should tag both browser and platform, where platformVersion is available', () => {
            const tags = tagPrinter.tagsFor({
                browserName:        'Chrome Headless',
                browserVersion:     '90.0.4430.212',
                platformName:       'darwin',
                os_version:         '20.4.0',
            } as WebdriverIO.Capabilities);

            expect(tags).have.lengthOf(2);
            expect(tags[0]).to.equal(new BrowserTag('Chrome Headless', '90.0.4430.212'));
            expect(tags[1]).to.equal(new PlatformTag('darwin', '20.4.0'));
        });

        describe('running on BrowserStack', () => {

            it('should correctly describe desired capabilities when "os" is given', () => {
                const tags = tagPrinter.tagsFor({
                    browser:            'Chrome',
                    browser_version:    '50',
                    os:                 'Windows',
                    os_version:         '10'
                } as WebdriverIO.Capabilities);

                expect(tags).have.lengthOf(2);
                expect(tags[0]).to.equal(new BrowserTag('Chrome', '50'));
                expect(tags[1]).to.equal(new PlatformTag('Windows', '10'));
            });

            it('should tag "platform" as unknown where "os" is missing', () => {
                const tags = tagPrinter.tagsFor({
                    browser:            'Chrome',
                    browser_version:    '50',
                } as WebdriverIO.Capabilities);

                expect(tags).have.lengthOf(2);
                expect(tags[0]).to.equal(new BrowserTag('Chrome', '50'));
                expect(tags[1]).to.equal(new PlatformTag('unknown'));
            });

            it('should tag "platform" even when "os_version" is missing', () => {
                const tags = tagPrinter.tagsFor({
                    browser:            'Chrome',
                    browser_version:    '50',
                    os:                 'Windows',
                } as WebdriverIO.Capabilities);

                expect(tags).have.lengthOf(2);
                expect(tags[0]).to.equal(new BrowserTag('Chrome', '50'));
                expect(tags[1]).to.equal(new PlatformTag('Windows'));
            });
        });

    });
});
