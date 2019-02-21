import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../abilities';

export class Target  {
    static the(name: string) {
        return {
            located: (byLocator: Locator): Question<ElementFinder> => new TargetElement(name, byLocator),
            in: (parent: KnowableUnknown<ElementFinder>) => {
                return {
                    located: (byLocator: Locator): Question<Promise<ElementFinder>> =>
                        new TargetNestedElement(parent, name, byLocator),
                };
            },
        };
    }

    static all(name: string) {
        return {
            located: (byLocator: Locator): Question<Promise<ElementFinder[]>> => new TargetElements(name, byLocator),
            in: (parent: KnowableUnknown<ElementFinder>) => {
                return {
                    located: (byLocator: Locator): Question<Promise<ElementFinder[]>> =>
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

export class TargetNestedElement implements Question<Promise<ElementFinder>> {

    constructor(
        private readonly parent: KnowableUnknown<ElementFinder>,
        private readonly name: string,
        private readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementFinder> {
        return actor.answer(this.parent).then(parent => override(
            parent.element(this.locator),
            'toString',
            this.toString.bind(this),
        ));

        // return override(
        //     this.parent.answeredBy(actor).element(this.locator),
        //     'toString',
        //     this.toString.bind(this),
        // );
    }

    toString() {
        return `the ${ this.name } in ${ this.parent }`;
    }
}

export class TargetElements implements Question<Promise<ElementFinder[]>> {
    constructor(
        private readonly name: string,
        private readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementFinder[]> {
        return Promise.resolve(BrowseTheWeb.as(actor).locateAll(this.locator).asElementFinders_())
            .then(finders => override(
                finders,
                'toString',
                this.toString.bind(this)),
            );
    }

    toString() {
        return `the ${ this.name }`;
    }
}

export class TargetNestedElements implements Question<Promise<ElementFinder[]>> {

    constructor(
        private readonly parent: KnowableUnknown<ElementFinder>,
        private readonly name: string,
        private readonly locator: Locator,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<ElementFinder[]> {
        return actor.answer(this.parent)
            .then(parent => parent.all(this.locator).asElementFinders_())
            .then(finders => override(
                finders,
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
