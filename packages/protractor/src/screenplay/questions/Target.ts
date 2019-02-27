import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';
import { RelativeQuestion } from './Pick';

export class Target  {
    static the(name: string) {
        return {
            located: (byLocator: Locator) =>
                new TargetElement(name, byLocator),

            of: (parent: Question<ElementFinder> | ElementFinder) => {
                return {
                    located: (byLocator: Locator): Question<ElementFinder> & RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder> =>
                        new TargetNestedElement(parent, new TargetElement(name, byLocator)),
                };
            },
        };
    }

    static all(name: string) {
        return {
            located: (byLocator: Locator) =>
                new TargetElements(name, byLocator),

            of: (parent: Question<ElementFinder> | ElementFinder) => {
                return {
                    located: (byLocator: Locator) =>
                        new TargetNestedElements(parent, new TargetElements(name, byLocator)),
                };
            },
        };
    }
}

export class TargetElement
    implements Question<ElementFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{
    constructor(
        protected readonly description: string,
        protected readonly locator: Locator,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElement(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return override(
            BrowseTheWeb.as(actor).locate(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    toString() {
        return `the ${ this.description }`;
    }
}

export class TargetNestedElement
    implements Question<ElementFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementFinder>
{
    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly child: Question<ElementFinder> | ElementFinder,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElement(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return withAnswerOf<ElementFinder, ElementFinder>(actor, this.parent, parent =>
            withAnswerOf<ElementFinder, ElementFinder>(actor, this.child, child => override(
                parent.element(child.locator()),
                'toString',
                this.toString.bind(this),
            )));
    }

    toString() {
        return `${ this.child.toString() } of ${ this.parent }`;
    }
}

export class TargetNestedElements
    implements Question<ElementArrayFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{

    constructor(
        private readonly parent: Question<ElementFinder> | ElementFinder,
        private readonly children: Question<ElementArrayFinder> | ElementArrayFinder,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElements(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return withAnswerOf<ElementFinder, ElementArrayFinder>(actor, this.parent, parent =>
            withAnswerOf<ElementArrayFinder, ElementArrayFinder>(actor, this.children, children => override(
                parent.all(children.locator()),
                'toString',
                this.toString.bind(this),
            )));
    }

    toString() {
        return `${ this.children.toString() } of ${ this.parent }`;
    }
}

export class TargetElements
    implements Question<ElementArrayFinder>, RelativeQuestion<Question<ElementFinder> | ElementFinder, ElementArrayFinder>
{
    constructor(
        private readonly description: string,
        private readonly locator: Locator,
    ) {
    }

    of(parent: Question<ElementFinder> | ElementFinder) {
        return new TargetNestedElements(parent, this);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return override(
            BrowseTheWeb.as(actor).locateAll(this.locator),
            'toString',
            this.toString.bind(this),
        );
    }

    toString() {
        return `the ${ this.description }`;
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
