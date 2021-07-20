import {
    Answerable,
    AnswersQuestions,
    MetaQuestion,
    Question,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

import { UnsupportedOperationError } from '../../errors';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Resolves to the value of a given [`input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
 *  {@link WebElement}, represented by {@link ElementHandle} or `Question<ElementHandle>`.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class Value
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<ElementHandle>, Promise<string>>
{
    /**
   * @param {Answerable<ElementHandle>} target
   * @returns {Value}
   */
    static of(target: Answerable<ElementHandle>): Value {
        return new Value(target);
    }

    /**
   * @param {Answerable<ElementHandle>} target
   */
    protected constructor(private readonly target: Answerable<ElementHandle>) {
        super(formatted`the value of ${target}`);
    }

    /**
   * @desc
   *  Resolves to the value of a given [`input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
   *  {@link WebElement}, located in the context of a `parent` element.
   *
   * @param {Answerable<ElementHandle>} parent
   * @returns {Question<Promise<string[]>>}
   *
   * @see {@link Target.all}
   * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
   */
    of(parent: Answerable<ElementHandle>): Question<Promise<string>> {
        throw new UnsupportedOperationError('Use Target...of(parent)');
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
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const element = await actor.answer(this.target);
        const value = await actor
      .abilityTo(BrowseTheWeb)
      .evaluate((element_: any) => element_.value, element);
        return value && value.toString();
    }
}
