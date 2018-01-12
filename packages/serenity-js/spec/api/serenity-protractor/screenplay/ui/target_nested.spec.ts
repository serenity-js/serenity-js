import * as webdriver from 'selenium-webdriver';

import {ElementArrayFinder} from 'protractor';
import {Locator} from 'protractor/built/locators';
import {Target} from '../../../../../src/screenplay-protractor';
import sinon = require('sinon');
import expect = require('../../../../expect');

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
                element          = sinon.spy();

            childTarget.resolveUsing(element);

            expect(element.callCount).to.equal(2);
            expect(element.getCall(0).args[0]).to.equal(parentLocator);
            expect(element.getCall(1).args[0]).to.equal(childLocator);
        });

        it ('can be resolved using protractor `element.all` resolver', () => {
            const
                elementFinder   = new ElementFinder(),
                elementAllResolver  = sinon.spy(elementFinder, 'all'),
                element          = sinon.spy(ElementFactory(elementFinder));

            childTarget.resolveAllUsing(element);

            expect(element.callCount).to.equal(1);
            expect(element.getCall(0).args[0]).to.equal(parentLocator);
            expect(elementAllResolver.getCall(0).args[0]).to.equal(childLocator);
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
                element          = sinon.spy();

            childTarget.resolveUsing(element);

            expect(element.callCount).to.equal(4);
            expect(element.getCall(0).args[0]).to.equal(grandGrandParentLocator);
            expect(element.getCall(1).args[0]).to.equal(grandParentLocator);
            expect(element.getCall(2).args[0]).to.equal(parentLocator);
            expect(element.getCall(3).args[0]).to.equal(childLocator);
        });

        it ('can be resolved using protractor `element.all` resolver', () => {
            const
                elementFinder   = new ElementFinder(),
                elementAllResolver  = sinon.spy(elementFinder, 'all'),
                elementResolver     = sinon.spy(elementFinder, 'element'),
                element          = sinon.spy(ElementFactory(elementFinder));

            childTarget.resolveAllUsing(element);

            expect(elementResolver.callCount).to.equal(3);
            expect(elementAllResolver.callCount).to.equal(1);
            expect(elementResolver.getCall(0).args[0]).to.equal(grandGrandParentLocator);
            expect(elementResolver.getCall(1).args[0]).to.equal(grandParentLocator);
            expect(elementResolver.getCall(2).args[0]).to.equal(parentLocator);
            expect(elementAllResolver.getCall(0).args[0]).to.equal(childLocator);
        });
    });

    const ElementFactory = function(finderSpy: ElementFinder) {
        return function(locator: Locator) {
            // Forward call to the ElementFinder mock to make it easy to test the resolver flow
            finderSpy.element(locator);
            return finderSpy;
        };
    };

    class ElementFinder {
        element(locator: Locator): ElementFinder {
            return this;
        }

        all(locator: Locator): ElementArrayFinder {
            return undefined;
        }
    }

});
