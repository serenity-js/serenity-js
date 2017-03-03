import sinon = require('sinon');
import expect = require('../../../expect');

import { ProtractorBrowser } from 'protractor';
import { WebDriver } from 'selenium-webdriver';

import { BrowseTheWeb, ResizeBrowserWindow } from '../../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../../src/serenity/screenplay';

describe('Interactions', () => {

    describe('ResizeBrowserWindow', () => {
        it ('can maximise the browser window', () => {

            const
                maximize = sinon.stub().returns(Promise.resolve()),
                browser  = fakeBrowser({ maximize }),
                actor    = Actor.named('James').whoCan(BrowseTheWeb.using(browser)),

                promise = ResizeBrowserWindow.toMaximum().performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(maximize).to.have.been.calledOnce;
            });
        });

        it ('can set the window size to an arbitrary width and height', () => {

            const
                setSize  = sinon.stub().returns(Promise.resolve()),
                browser  = fakeBrowser({ setSize }),
                actor    = Actor.named('James').whoCan(BrowseTheWeb.using(browser)),

                promise = ResizeBrowserWindow.to(1024, 768).performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(setSize).to.have.been.calledWithExactly(1024, 768);
            });
        });

        function fakeBrowser(windowOptions): ProtractorBrowser {
            const
                browser: ProtractorBrowser = sinon.createStubInstance(ProtractorBrowser) as any,
                driver:  any               = sinon.createStubInstance(WebDriver) as any,
                window = () => windowOptions;

            driver.manage = (): any => ({ window });

            browser.driver = driver;

            return browser;
        }
    });
});
