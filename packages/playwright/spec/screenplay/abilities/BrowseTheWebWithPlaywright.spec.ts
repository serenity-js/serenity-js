import { afterEach, beforeEach, describe, it } from 'mocha';
import type * as playwright from 'playwright-core';
import * as sinon from 'sinon';

import { BrowseTheWebWithPlaywright } from '../../../src/screenplay/abilities/BrowseTheWebWithPlaywright.js';
import { expect } from '../../expect.js';

describe('BrowseTheWebWithPlaywright', () => {

    let electronApp: sinon.SinonStubbedInstance<playwright.ElectronApplication>;
    let browserContext: sinon.SinonStubbedInstance<playwright.BrowserContext>;
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
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('usingElectronApp()', () => {

        it('creates an ability to browse the web using an Electron application', () => {
            const ability = BrowseTheWebWithPlaywright.usingElectronApp(
                electronApp as unknown as playwright.ElectronApplication
            );

            expect(ability).to.be.instanceOf(BrowseTheWebWithPlaywright);
        });

        it('accepts optional ExtraBrowserContextOptions', () => {
            const ability = BrowseTheWebWithPlaywright.usingElectronApp(
                electronApp as unknown as playwright.ElectronApplication,
                {
                    defaultTimeout: 5000,
                    defaultNavigationTimeout: 10000,
                }
            );

            expect(ability).to.be.instanceOf(BrowseTheWebWithPlaywright);
        });

        it('does not close the Electron application when discarded', async () => {
            const ability = BrowseTheWebWithPlaywright.usingElectronApp(
                electronApp as unknown as playwright.ElectronApplication
            );

            // Get a page to register it
            await ability.currentPage();

            // Discard the ability
            await ability.discard();

            // Verify the app was NOT closed
            expect(electronApp.close).to.not.have.been.called;
        });
    });

    describe('launchingElectronApp()', () => {

        let electronLaunchStub: sinon.SinonStub;

        afterEach(() => {
            if (electronLaunchStub) {
                electronLaunchStub.restore();
            }
        });

        it('creates an ability to browse the web by launching an Electron application', () => {
            const ability = BrowseTheWebWithPlaywright.launchingElectronApp({
                args: ['main.js'],
            });

            expect(ability).to.be.instanceOf(BrowseTheWebWithPlaywright);
        });

        it('accepts optional ExtraBrowserContextOptions', () => {
            const ability = BrowseTheWebWithPlaywright.launchingElectronApp(
                { args: ['main.js'] },
                {
                    defaultTimeout: 5000,
                    defaultNavigationTimeout: 10000,
                }
            );

            expect(ability).to.be.instanceOf(BrowseTheWebWithPlaywright);
        });

        it('closes the Electron application when discarded', async () => {
            const playwrightModule = await import('playwright-core');
            electronLaunchStub = sinon.stub(playwrightModule._electron, 'launch').resolves(
                electronApp as unknown as playwright.ElectronApplication
            );

            const ability = BrowseTheWebWithPlaywright.launchingElectronApp({
                args: ['main.js'],
            });

            // Get a page to initialise and register it
            await ability.currentPage();

            // Discard the ability
            await ability.discard();

            // Verify the app WAS closed
            expect(electronApp.close).to.have.been.calledOnce;
        });
    });
});
