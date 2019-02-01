import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator, WebElement } from 'protractor';
import { BrowseTheWeb } from '../abilities';

export abstract class Target<T extends WebElement> implements Question<T> {
    static the(name: string) {
        return {
            located: (byLocator: Locator): Target<ElementFinder> => new TargetSingleElement(name, byLocator),
        };
    }

    static all(name: string) {
        return {
            located: (byLocator: Locator): Target<ElementArrayFinder> => new TargetMultipleElements(name, byLocator),
        };
    }

    constructor(
        protected readonly name: string,
        protected readonly locator: Locator,
    ) {
    }

    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;
}

class TargetSingleElement extends Target<ElementFinder> {
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return BrowseTheWeb.as(actor).locate(this.locator);
    }

    toString() {
        return `the ${ this.name }`;
    }
}

class TargetMultipleElements extends Target<ElementArrayFinder> {
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return BrowseTheWeb.as(actor).locateAll(this.locator);
    }

    toString() {
        return `all the ${ this.name }`;
    }
}
