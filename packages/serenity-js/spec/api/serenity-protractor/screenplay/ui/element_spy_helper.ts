import {ElementArrayFinder, ElementHelper} from 'protractor';
import {Locator} from 'protractor/built/locators';
import sinon = require('sinon');
import {SinonSpy} from 'sinon';

export interface ElementSpyHelper {
    elementHelper: ElementHelper;
    elementSpy: SinonSpy;
    elementAllSpy: SinonSpy;
}

export class ElementSpyHelperFactory {

    public static createElementSpyHelper(): ElementSpyHelper {
        const elementFinder: ElementFinder = new ElementFinder();
        const elementAllSpy = sinon.spy(elementFinder, 'all');
        const elementSpy = sinon.spy(elementFinder, 'element');

        const elementHelper = ((locator: Locator) => {
                // Forward call to the ElementFinder mock to make it easy to test the resolver flow
                elementFinder.element(locator);
                return elementFinder;
            }) as ElementHelper;

        elementHelper.all = elementAllSpy;

        return {
            elementHelper,
            elementSpy,
            elementAllSpy,
        };
    };
}

class ElementFinder {
    element(locator: Locator): ElementFinder {
        return this;
    }

    all(locator: Locator): ElementArrayFinder {
        return undefined;
    }
}
