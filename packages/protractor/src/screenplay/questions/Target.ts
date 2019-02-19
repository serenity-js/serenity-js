import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator, WebElement } from 'protractor';
import { BrowseTheWeb } from '../abilities';

export abstract class Target<T extends WebElement> implements Question<T> {
    static the(name: string) {
        return {
            located: (byLocator: Locator): Target<ElementFinder> => new TargetElement(name, byLocator),
            in: (parent: Target<ElementFinder>) => {
                return {
                    located: (byLocator: Locator): Target<ElementFinder> =>
                        new TargetNestedElement(parent, name, byLocator),
                };
            },
        };
    }

    static all(name: string) {
        return {
            located: (byLocator: Locator): Target<ElementArrayFinder> => new TargetElements(name, byLocator),
            in: (parent: Target<ElementFinder>) => {
                return {
                    located: (byLocator: Locator): Target<ElementArrayFinder> =>
                        new TargetNestedElements(parent, name, byLocator),
                };
            },
        };
    }

    constructor(
        protected readonly name: string,
        protected readonly locator: Locator,
    ) {
    }

    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;
}

export class TargetElement extends Target<ElementFinder> {
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        const elf = BrowseTheWeb.as(actor).locate(this.locator);

        return override(elf, 'toString', this.toString.bind(this));
    }

    toString() {
        return `the ${ this.name }`;
    }
}

export class TargetNestedElement extends Target<ElementFinder> {

    constructor(
        private readonly parent: Target<ElementFinder>,
        name: string,
        locator: Locator,
    ) {
        super(name, locator);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        const elf = this.parent.answeredBy(actor).element(this.locator);

        return override(elf, 'toString', this.toString.bind(this));
    }

    toString() {
        return `the ${ this.name } in ${ this.parent }`;
    }
}

export class TargetElements extends Target<ElementArrayFinder> {
    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        const eaf = BrowseTheWeb.as(actor).locateAll(this.locator);

        return override(eaf, 'toString', this.toString.bind(this));
    }

    toString() {
        return `the ${ this.name }`;
    }
}

export class TargetNestedElements extends Target<ElementArrayFinder> {

    constructor(
        private readonly parent: Target<ElementFinder>,
        name: string,
        locator: Locator,
    ) {
        super(name, locator);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        const eaf = this.parent.answeredBy(actor).all(this.locator);

        return override(eaf, 'toString', this.toString.bind(this));
    }

    toString() {
        return `all the ${ this.name } in ${ this.parent }`;
    }
}

function override<T extends object, K extends keyof T>(obj: T, name: K, implementation: T[K]) {
    return new Proxy<T>(obj, {
        get(o: T, prop: string | number) {
            return prop === name
                ? implementation
                : obj[prop];
        },
    });
}
