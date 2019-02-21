import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { Attribute } from './Attribute';

export class Value implements Question<Promise<string>> {
    static of(target: KnowableUnknown<ElementFinder>) {
        return new Value(target);
    }

    constructor(private readonly target: KnowableUnknown<ElementFinder>) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return Attribute.of(this.target).called('value').answeredBy(actor);
    }

    toString(): string {
        return formatted `the value of ${ this.target}`;
    }
}
