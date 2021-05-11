import { AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

import { Attribute } from './Attribute';
import { TargetNestedElement } from './targets';

/**
 * @desc
 *  Resolves to the value of a given [`input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
 *  {@link WebElement}, represented by {@link ElementFinder} or `Question<ElementFinder>`.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class Value
    extends Question<Promise<string>>
    implements MetaQuestion<Question<ElementFinder> | ElementFinder, Promise<string>>
{
    /**
     * @param {Question<ElementFinder> | ElementFinder} target
     * @returns {Value}
     */
    static of(target: Question<ElementFinder> | ElementFinder): Value {
        return new Value(target);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} target
     */
    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super(formatted `the value of ${ target}`);
    }

    /**
     * @desc
     *  Resolves to the value of a given [`input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
     *  {@link WebElement}, located in the context of a `parent` element.
     *
     * @param {Question<ElementFinder> | ElementFinder} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Target.all}
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
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
