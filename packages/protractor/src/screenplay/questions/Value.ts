import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

import { Attribute } from './Attribute';
import { TargetNestedElement } from './targets';

export class Value
    extends Question<Promise<string>>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
{
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new Value(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super(formatted `the value of ${ target}`);
    }

    of(parent: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new Value(new TargetNestedElement(parent, this.target));
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
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return Attribute.of(this.target).called('value').answeredBy(actor);
    }
}
