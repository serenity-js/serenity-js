import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { withElementFinder } from '../withElementFinder';

export class Attribute implements Question<Promise<string>> {
    static of(target: Question<ElementFinder> | ElementFinder) {
        return {
            called: (name: KnowableUnknown<string>) => new Attribute(target, name),
        };
    }

    constructor(
        private readonly target: Question<ElementFinder> | ElementFinder,
        private readonly name: KnowableUnknown<string>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return actor.answer(this.name)
            .then(name => withElementFinder(actor, this.target, elf => elf.getAttribute(name)));
    }

    toString(): string {
        return formatted `the value of the ${ this.name } attribute of ${ this.target}`;
    }
}
