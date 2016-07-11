import sinon = require('sinon');

import expect = require('../expect');
import { Target } from '../../src/screenplay-protractor/ui/target';

import * as webdriver from 'selenium-webdriver';

describe('Target', () => {

    it('represents a named locator', () => {

        let target = Target.the('"Sign Up" button');

        expect(target.toString()).to.equal('the "Sign Up" button');
    });

    it('can be resolved using protractor `element` resolver', () => {
        let element     = sinon.spy(),
            byLocator   = webdriver.By.css('button#sign-up'),
            target      = Target.the('"Sign Up" butting').located(byLocator);

        target.resolveUsing(element);

        expect(element).to.have.been.calledWith(byLocator);
    });
});
