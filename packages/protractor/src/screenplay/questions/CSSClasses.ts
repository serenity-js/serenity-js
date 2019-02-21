import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { Attribute } from './Attribute';

export class CSSClasses implements Question<Promise<string[]>> {
    static of(target: KnowableUnknown<ElementFinder>) {
        return new CSSClasses(target);
    }

    constructor(private readonly target: KnowableUnknown<ElementFinder>) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        return Attribute.of(this.target).called('class').answeredBy(actor)
            .then(attribute => attribute
                .replace(/\s+/, ' ')
                .trim()
                .split(' ')
                .filter(cssClass => !! cssClass),
            );
    }

    toString(): string {
        return formatted `the CSS classes of ${ this.target}`;
    }
}
