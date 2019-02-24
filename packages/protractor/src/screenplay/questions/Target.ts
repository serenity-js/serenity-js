import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withElementFinder } from '../withElementFinder';

export class Target  {
    static the(name: string) {
        return {
            located: (byLocator: Locator): Question<ElementFinder> => new TargetElement(name, byLocator),
            in: (parent: Question<ElementFinder> | ElementFinder) => {
                return {
                    located: (byLocator: Locator): Question<ElementFinder> =>
                        new TargetNestedElement(parent, name, byLocator),
                };
            },
        };
    }

    static all(name: string) {
        return {
            located: (byLocator: Locator): Question<ElementArrayFinder> => new TargetElements(name, byLocator),
            in: (parent: Question<ElementFinder> | ElementFinder) => {
                return {
                    located: (byLocator: Locator): Question<ElementArrayFinder> =>
                        new TargetNestedElements(parent, name, byLocator),
                };
            },
        };
    }
}

export class TargetElement implements Question<ElementFinder> {
    constructor(
        protected readonly name: string,
        protected readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return override(
            BrowseTheWeb.as(actor).locate(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    toString() {
        return `the ${ this.name }`;
    }
}

export class TargetNestedElement implements Question<ElementFinder> {

    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly name: string,
        private readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return withElementFinder(actor, this.parent, parent => override(
            parent.element(this.locator),
            'toString',
            this.toString.bind(this),
        ));
    }

    toString() {
        return `the ${ this.name } in ${ this.parent }`;
    }
}

export class TargetElements implements Question<ElementArrayFinder> {
    constructor(
        private readonly name: string,
        private readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return override(
            BrowseTheWeb.as(actor).locateAll(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    toString() {
        return `the ${ this.name }`;
    }
}

export class TargetNestedElements implements Question<ElementArrayFinder> {

    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly name: string,
        private readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return withElementFinder(actor, this.parent, parent => override(
            parent.all(this.locator),
            'toString',
            this.toString.bind(this),
        ));
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
