import { afterEach, beforeEach, describe, it } from 'mocha';
import type * as playwright from 'playwright-core';
import * as sinon from 'sinon';

import type { ElectronLaunchOptions } from '../../../src/screenplay/models/ElectronLaunchOptions.js';
import { SelfLaunchingPlaywrightBrowsingSessionWithElectron } from '../../../src/screenplay/models/SelfLaunchingPlaywrightBrowsingSessionWithElectron.js';
import { expect } from '../../expect.js';

describe('SelfLaunchingPlaywrightBrowsingSessionWithElectron', () => {

    let electronApp: sinon.SinonStubbedInstance<playwright.ElectronApplication>;
    let browserContext: sinon.SinonStubbedInstance<playwright.BrowserContext>;
    let selectors: sinon.SinonStubbedInstance<playwright.Selectors>;
    let page: sinon.SinonStubbedInstance<playwright.Page>;
    let electronLaunchStub: sinon.SinonStub;

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

        it('accepts ElectronLaunchOptions', () => {
            const launchOptions: ElectronLaunchOptions = {
                args: ['main.js'],
            };

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                launchOptions,
                {},
                selectors as unknown as playwright.Selectors
            );

            expect(session).to.be.instanceOf(SelfLaunchingPlaywrightBrowsingSessionWithElectron);
        });
    });

    describe('isInitialised()', () => {

        it('returns false before initialise() is called', () => {
            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            expect(session.isInitialised()).to.equal(false);
        });

        it('returns true after initialise() is called', async () => {
            // Stub the _electron.launch method
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.initialise();

            expect(session.isInitialised()).to.equal(true);
        });
    });

    describe('initialise()', () => {

        it('launches the Electron app with the provided options', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const launchOptions: ElectronLaunchOptions = {
                args: ['main.js'],
                cwd: '/path/to/app',
            };

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                launchOptions,
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.initialise();

            expect(electronLaunchStub).to.have.been.calledOnceWith(launchOptions);
        });

        it('is idempotent - calling multiple times launches only once', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.initialise();
            await session.initialise();
            await session.initialise();

            expect(electronLaunchStub).to.have.been.calledOnce;
        });
    });

    describe('currentPage()', () => {

        it('auto-initialises if not already initialised', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            expect(session.isInitialised()).to.equal(false);

            await session.currentPage();

            expect(session.isInitialised()).to.equal(true);
        });
    });

    describe('allPages()', () => {

        it('auto-initialises if not already initialised', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            expect(session.isInitialised()).to.equal(false);

            await session.allPages();

            expect(session.isInitialised()).to.equal(true);
        });
    });

    describe('browserCapabilities()', () => {

        it('auto-initialises and returns Electron capabilities', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            const capabilities = await session.browserCapabilities();

            expect(capabilities.browserName).to.equal('electron');
            expect(session.isInitialised()).to.equal(true);
        });
    });

    describe('closeAllPages()', () => {

        it('closes all windows but does not close the Electron application', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.initialise();
            await session.currentPage(); // Register a page
            await session.closeAllPages();

            // Verify the app was NOT closed
            expect(electronApp.close).to.not.have.been.called;
            // Session should still be initialised
            expect(session.isInitialised()).to.equal(true);
        });

        it('does nothing if not initialised', async () => {
            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            // Should not throw
            await session.closeAllPages();

            expect(session.isInitialised()).to.equal(false);
        });
    });

    describe('closeElectronApp()', () => {

        it('closes the Electron application', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.initialise();
            await session.closeElectronApp();

            expect(electronApp.close).to.have.been.calledOnce;
        });

        it('resets the initialised state after closing', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            await session.initialise();
            expect(session.isInitialised()).to.equal(true);

            await session.closeElectronApp();
            expect(session.isInitialised()).to.equal(false);
        });

        it('does nothing if not initialised', async () => {
            const session = new SelfLaunchingPlaywrightBrowsingSessionWithElectron(
                { args: ['main.js'] },
                {},
                selectors as unknown as playwright.Selectors
            );

            // Should not throw
            await session.closeElectronApp();

            expect(session.isInitialised()).to.equal(false);
        });
    });
});
