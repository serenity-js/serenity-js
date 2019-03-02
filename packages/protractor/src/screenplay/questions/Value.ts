import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

import { Attribute } from './Attribute';
import { RelativeQuestion } from './RelativeQuestion';
import { TargetNestedElement } from './targets';

export class Value
    implements Question<Promise<string>>, RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
{
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new Value(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new Value(new TargetNestedElement(parent, this.target));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return Attribute.of(this.target).called('value').answeredBy(actor);
    }

    toString(): string {
        return formatted `the value of ${ this.target}`;
    }
}
