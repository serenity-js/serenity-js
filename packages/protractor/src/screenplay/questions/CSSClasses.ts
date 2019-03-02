import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { Attribute } from './Attribute';
import { RelativeQuestion } from './RelativeQuestion';
import { TargetNestedElement } from './targets';

export class CSSClasses
    implements Question<Promise<string[]>>, RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>
{
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new CSSClasses(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string[]>> {
        return new CSSClasses(new TargetNestedElement(parent, this.target));
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
