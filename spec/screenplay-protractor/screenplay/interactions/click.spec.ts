import sinon = require('sinon');
import expect = require('../../../expect');
import * as webdriver from 'selenium-webdriver';

import { BrowseTheWeb, Click, Target } from '../../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../../src/serenity/screenplay';
import { fakeBrowserLocating } from './fake_browser';

describe('Interactions', () => {

    describe('Click', () => {
        const byLocator = webdriver.By.css('button#sign-up'),
              target    = Target.the('"Sign Up" button').located(byLocator);

        it ('triggers a click event on an element identified by the Target', () => {
            let element = <any> sinon.createStubInstance(webdriver.WebElement),
                actor   = Actor.named('James').whoCan(BrowseTheWeb.using(fakeBrowserLocating(element)));

            element.click.returns(Promise.resolve());

            let promise = Click.on(target).performAs(actor);

            return expect(promise).to.be.eventually.fulfilled.then(() => {
                expect(element.click).to.have.been.calledOnce;
            });
        });
    });
});
