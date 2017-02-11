import sinon = require('sinon');
import expect = require('../../../expect');
import { ProtractorBrowser } from 'protractor';

import { BrowseTheWeb, Open } from '../../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../../src/serenity/screenplay';

describe('Interactions', () => {

    describe('Open', () => {
        it ('opens a website specified by the url', () => {
            const
                browser: ProtractorBrowser = sinon.createStubInstance(ProtractorBrowser) as any,
                actor = Actor.named('James').whoCan(BrowseTheWeb.using(browser));

            const url    = '/home/index.html';

            (browser.get as any).withArgs(url).returns(Promise.resolve());

            const promise = Open.browserOn(url).performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(browser.get).to.have.been.calledWith(url);
            });
        });
    });
});
