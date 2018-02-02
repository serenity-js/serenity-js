import * as webdriver from 'selenium-webdriver';

import {Target} from '../../../../../src/screenplay-protractor';
import expect = require('../../../../expect');
import {ElementSpyHelperFactory} from './element_spy_helper';

describe('Nested target', () => {
    const
        grandGrandParentLocator     = webdriver.By.css('div.grand-grand-parent'),
        grandParentLocator          = webdriver.By.css('div.grand-parent'),
        parentLocator               = webdriver.By.css('div.parent'),
        childLocator                = webdriver.By.css('div.child');

    describe ('with one level nesting', () => {
        const
            parentTarget     = Target.the('parent').located(parentLocator),
            childTarget      = Target.within(parentTarget).the('child').located(childLocator);

        it ('can be resolved using protractor `element` resolver', () => {
            const
                elementSpyHelper   = ElementSpyHelperFactory.createElementSpyHelper(),
                element             = elementSpyHelper.elementHelper,
                elementSpy          = elementSpyHelper.elementSpy;

            childTarget.resolveUsing(element);

            expect(elementSpy.callCount).to.equal(2);
            expect(elementSpy.getCall(0).args[0]).to.equal(parentLocator);
            expect(elementSpy.getCall(1).args[0]).to.equal(childLocator);
        });

        it ('can be resolved using protractor `element.all` resolver', () => {
            const
                elementSpyHelper   = ElementSpyHelperFactory.createElementSpyHelper(),
                element             = elementSpyHelper.elementHelper,
                elementSpy          = elementSpyHelper.elementSpy,
                elementAllSpy       = elementSpyHelper.elementAllSpy;

            childTarget.resolveAllUsing(element);

            expect(elementSpy.callCount).to.equal(1);
            expect(elementSpy.getCall(0).args[0]).to.equal(parentLocator);
            expect(elementAllSpy.getCall(0).args[0]).to.equal(childLocator);
        });
    });

    describe ('with deep nesting', () => {
        const
            grandGrandParentTarget      = Target.the('grand-grand-parent').located(grandGrandParentLocator),
            grandParentTarget           = Target.within(grandGrandParentTarget).the('grand-parent').located(grandParentLocator),
            parentTarget                = Target.within(grandParentTarget).the('parent').located(parentLocator),
            childTarget                 = Target.within(parentTarget).the('child').located(childLocator);

        it ('can be resolved using protractor `element` resolver', () => {
            const
                elementSpyHelper   = ElementSpyHelperFactory.createElementSpyHelper(),
                element             = elementSpyHelper.elementHelper,
                elementSpy          = elementSpyHelper.elementSpy;

            childTarget.resolveUsing(element);

            expect(elementSpy.callCount).to.equal(4);
            expect(elementSpy.getCall(0).args[0]).to.equal(grandGrandParentLocator);
            expect(elementSpy.getCall(1).args[0]).to.equal(grandParentLocator);
            expect(elementSpy.getCall(2).args[0]).to.equal(parentLocator);
            expect(elementSpy.getCall(3).args[0]).to.equal(childLocator);
        });

        it ('can be resolved using protractor `element.all` resolver', () => {
            const
                elementSpyHelper   = ElementSpyHelperFactory.createElementSpyHelper(),
                element             = elementSpyHelper.elementHelper,
                elementSpy          = elementSpyHelper.elementSpy,
                elementAllSpy       = elementSpyHelper.elementAllSpy;

            childTarget.resolveAllUsing(element);

            expect(elementSpy.callCount).to.equal(3);
            expect(elementAllSpy.callCount).to.equal(1);
            expect(elementSpy.getCall(0).args[0]).to.equal(grandGrandParentLocator);
            expect(elementSpy.getCall(1).args[0]).to.equal(grandParentLocator);
            expect(elementSpy.getCall(2).args[0]).to.equal(parentLocator);
            expect(elementAllSpy.getCall(0).args[0]).to.equal(childLocator);
        });
    });

});
