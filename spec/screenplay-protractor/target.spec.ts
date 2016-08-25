import sinon = require('sinon');

import expect = require('../expect');
import { Target } from '../../src/screenplay-protractor';

import * as webdriver from 'selenium-webdriver';

describe('Target', () => {

    const byLocator = webdriver.By.css('button#sign-up');

    it('represents a named locator', () => {

        let target = Target.the('"Sign Up" button').located(byLocator);

        expect(target.toString()).to.equal('the "Sign Up" button');
    });

    it('can be resolved using protractor `element` resolver', () => {
        let element     = sinon.spy(),
            target      = Target.the('"Sign Up" button').located(byLocator);

        target.resolveUsing(element);

        expect(element).to.have.been.calledWith(byLocator);
    });

    it('can have its name changed at a later stage', () => {
        let target      = Target.the('Nav button').located(byLocator);

        expect(target.called('"Sign Up" button').toString()).to.equal('the "Sign Up" button');
    });

    it('can have a locator defined using tokens to be resolved at a later stage', () => {
        let byLocatorTemplate = webdriver.By.css('{0}#sign-up.{1}'),
            element     = sinon.spy(),
            target      = Target.the('"Sign Up" button').located(byLocatorTemplate);

        target.of('button', 'active').resolveUsing(element);

        expect(element).to.have.been.calledWith(webdriver.By.css('button#sign-up.active'));
    });
});
