import sinon = require('sinon');
import expect = require('../../../expect');

import { Target } from '../../../../src/screenplay-protractor';

import * as webdriver from 'selenium-webdriver';

describe ('Target', () => {

    const byLocator = webdriver.By.css('button#sign-up');

    it ('represents a named locator', () => {

        let target = Target.the('"Sign Up" button').located(byLocator);

        expect(target.toString()).to.equal('the "Sign Up" button');
    });

    it ('can be resolved using protractor `element` resolver', () => {
        let element     = sinon.spy(),
            target      = Target.the('"Sign Up" button').located(byLocator);

        target.resolveUsing(element);

        expect(element).to.have.been.calledWith(byLocator);
    });

    it ('can have its name changed at a later stage', () => {
        let target      = Target.the('Nav button').located(byLocator);

        expect(target.called('"Sign Up" button').toString()).to.equal('the "Sign Up" button');
    });

    it ('can have a CSS locator defined using tokens to be resolved at a later stage', () => {
        let byLocatorTemplate = webdriver.By.css('{0}#sign-up.{1}'),
            element     = sinon.spy(),
            target      = Target.the('"Sign Up" button').located(byLocatorTemplate);

        target.of('button', 'active').resolveUsing(element);

        expect(element).to.have.been.calledWith(webdriver.By.css('button#sign-up.active'));
    });

    it ('can have an ID locator defined using tokens to be resolved at a later stage', () => {
        let byLocatorTemplate = webdriver.By.id('sign-up-{0}'),
            element     = sinon.spy(),
            target      = Target.the('"Sign Up" button').located(byLocatorTemplate);

        target.of('button').resolveUsing(element);

        expect(element).to.have.been.calledWith(webdriver.By.id('sign-up-button'));
    });

    it ('correctly overrides the toString method of the cloned locator', () => {
        let byLocatorTemplate = webdriver.By.id('sign-up-{0}'),
            target      = Target.the('"Sign Up" button').located(byLocatorTemplate);

        let result = (<any> target.of('button')).locator.toString();

        expect(result).to.equal('By(css selector, *[id="sign-up-button"])');
    });

    it ('can describe a locator matching multiple elements', () => {
        let byGroupLocator = webdriver.By.css('ul>li'),
            element        = { all: sinon.spy() },
            target         = Target.the('items').located(byGroupLocator);

        target.resolveAllUsing(element);

        expect(element.all).to.have.been.calledWith(webdriver.By.css('ul>li'));
    });

    it ('complains if it cannot replace the tokens defined in the locator (Protractor issue #3508)', () => {
        let byModelTemplate: any = {
                toString: () => 'by.model("checkbox")',
            },
            target      = Target.the('checkbox').located(byModelTemplate);

        expect(() => {
            target.of('some-replacement');
        }).to.throw('by.model("checkbox") is not a webdriver-compatible locator so you won\'t be able to use token replacement with it');
    });

    describe ('TargetBuilder', () => {
        it ('is easy to identify', () => {
            let target = Target.the('sign up form');

            expect(target.toString()).to.equal('TargetBuilder for the sign up form');
        });
    });
});
