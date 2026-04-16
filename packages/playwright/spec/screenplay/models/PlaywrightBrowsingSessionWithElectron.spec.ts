import { afterEach, beforeEach, describe, it } from 'mocha';
import type * as playwright from 'playwright-core';
import * as sinon from 'sinon';

import { PlaywrightBrowsingSessionWithElectron } from '../../../src/screenplay/models/PlaywrightBrowsingSessionWithElectron.js';
import { expect } from '../../expect.js';

describe('PlaywrightBrowsingSessionWithElectron', () => {

    let electronApp: sinon.SinonStubbedInstance<playwright.ElectronApplication>;
    let browserContext: sinon.SinonStubbedInstance<playwright.BrowserContext>;
    let selectors: sinon.SinonStubbedInstance<playwright.Selectors>;
    let page: sinon.SinonStubbedInstance<playwright.Page>;

    beforeEach(() => {
        // Create mock frame
        const frame = {
            locator: sinon.stub(),
        };

        // Create mock page
        page = {
            on: sinon.stub(),
            off: sinon.stub(),
            close: sinon.stub().resolves(),
            url: sinon.stub().returns('file:///app/index.html'),
            title: sinon.stub().resolves('Test App'),
            isClosed: sinon.stub().returns(false),
            mainFrame: sinon.stub().returns(frame),
            viewportSize: sinon.stub().returns({ width: 800, height: 600 }),
        } as unknown as sinon.SinonStubbedInstance<playwright.Page>;

        // Create mock browser context
        browserContext = {
            on: sinon.stub(),
            pages: sinon.stub().returns([page]),
            addCookies: sinon.stub().resolves(),
            clearCookies: sinon.stub().resolves(),
            setDefaultNavigationTimeout: sinon.stub(),
            setDefaultTimeout: sinon.stub(),
        } as unknown as sinon.SinonStubbedInstance<playwright.BrowserContext>;

        // Create mock Electron application
        electronApp = {
            context: sinon.stub().returns(browserContext),
            windows: sinon.stub().returns([page]),
            firstWindow: sinon.stub().resolves(page),
            on: sinon.stub(),
            evaluate: sinon.stub().resolves('28.0.0'),
            close: sinon.stub().resolves(),
        } as unknown as sinon.SinonStubbedInstance<playwright.ElectronApplication>;

        // Create mock selectors
        selectors = {
            register: sinon.stub().resolves(),
        } as unknown as sinon.SinonStubbedInstance<playwright.Selectors>;
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('constructor', () => {

        it('accepts an ElectronApplication instance', () => {
            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            expect(session).to.be.instanceOf(PlaywrightBrowsingSessionWithElectron);
        });
    });

    describe('browserCapabilities()', () => {

        it('returns capabilities identifying the Electron runtime', async () => {
            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            const capabilities = await session.browserCapabilities();

            expect(capabilities.browserName).to.equal('electron');
            expect(capabilities.browserVersion).to.equal('28.0.0');
            expect(capabilities.platformName).to.equal(process.platform);
        });

        it('returns "unknown" version when Electron version cannot be determined', async () => {
            electronApp.evaluate.rejects(new Error('Cannot evaluate'));

            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            const capabilities = await session.browserCapabilities();

            expect(capabilities.browserVersion).to.equal('unknown');
        });
    });

    describe('currentPage()', () => {

        it('waits for the first window when no windows exist', async () => {
            electronApp.windows.returns([]);

            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.currentPage();

            expect(electronApp.firstWindow).to.have.been.calledOnce;
        });

        it('uses existing windows when available', async () => {
            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.currentPage();

            expect(electronApp.firstWindow).to.not.have.been.called;
        });
    });

    describe('closeAllPages()', () => {

        it('closes all windows but does not close the Electron application', async () => {
            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            // First get a page to register it
            await session.currentPage();

            // Then close all pages
            await session.closeAllPages();

            // Verify the app was NOT closed
            expect(electronApp.close).to.not.have.been.called;
        });
    });

    describe('allPages()', () => {

        it('returns all registered pages', async () => {
            const session = new PlaywrightBrowsingSessionWithElectron(
                electronApp as unknown as playwright.ElectronApplication,
                {},
                selectors as unknown as playwright.Selectors
            );

            // Get the current page to register it
            await session.currentPage();

            const pages = await session.allPages();

            expect(pages).to.have.lengthOf(1);
        });
    });
});
