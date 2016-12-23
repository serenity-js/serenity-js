import sinon = require('sinon');
import expect = require('../../../expect');
import * as webdriver from 'selenium-webdriver';

import { BrowseTheWeb, Enter, Target } from '../../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../../src/serenity/screenplay';
import { fakeBrowserLocating } from './fake_browser';

describe('Interactions', () => {

    describe('Enter', () => {
        const byLocator = webdriver.By.css('input#username'),
              target    = Target.the('"Username" field').located(byLocator);

        it ('triggers a sendKeys event on an element identified by the Target', () => {
            let element = <any> sinon.createStubInstance(webdriver.WebElement),
                actor   = Actor.named('James').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            let promise = Enter.theValue('Jan').into(target).performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Jan');
            });
        });

        it ('allows an additional keystroke to be sent into the Target', () => {
            let element = <any> sinon.createStubInstance(webdriver.WebElement),
                actor   = Actor.named('James').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            let promise = Enter.theValue('Jan').into(target).thenHit(webdriver.Key.ENTER).performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.sendKeys).to.have.been.calledWith('Jan');
                expect(element.sendKeys).to.have.been.calledWith(webdriver.Key.ENTER);
            });
        });
    });
});
