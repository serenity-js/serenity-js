import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { Target } from './Target';

export class Attribute implements Question<Promise<string>> {
    static of(target: Target<ElementFinder>) {
        return {
            called: (name: KnowableUnknown<string>) => new Attribute(target, name),
        };
    }

    constructor(
        private readonly target: Target<ElementFinder>,
        private readonly name: KnowableUnknown<string>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return Promise.all([
            actor.answer(this.target),
            actor.answer(this.name),
        ]).then(([target, name]) => target.getAttribute(name));
    }

    toString(): string {
        return formatted `the value of the ${ this.name } attribute of ${ this.target}`;
    }
}
