import sinon = require('sinon');
import expect = require('../../../expect');
import { ProtractorBrowser } from 'protractor';

import { BrowseTheWeb, Open } from '../../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../../src/serenity/screenplay';

describe('Interactions', () => {

    describe('Open', () => {
        it ('opens a website specified by the url', () => {
            let browser: ProtractorBrowser = <any> sinon.createStubInstance(ProtractorBrowser),
                actor = Actor.named('James').whoCan(BrowseTheWeb.using(browser));

            let url    = '/home/index.html';

            (<any> browser.get).withArgs(url).returns(Promise.resolve());

            let promise = Open.browserOn(url).performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(browser.get).to.have.been.calledWith(url);
            });
        });
    });
});
