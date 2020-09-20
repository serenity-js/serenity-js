import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { Attribute } from './Attribute';
import { RelativeQuestion } from './RelativeQuestion';
import { TargetNestedElement } from './targets';

export class CSSClasses
    extends Question<Promise<string[]>>
    implements RelativeQuestion<Question<ElementFinder> | ElementFinder, Promise<string[]>>
{
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new CSSClasses(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super(formatted `the CSS classes of ${ target}`);
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string[]>> {
        return new CSSClasses(new TargetNestedElement(parent, this.target));
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        return Attribute.of(this.target).called('class').answeredBy(actor)
            .then(attribute => attribute
                .replace(/\s+/, ' ')
                .trim()
                .split(' ')
                .filter(cssClass => !! cssClass),
            );
    }
}
