import {
    Answerable,
    AnswersQuestions,
    MetaQuestion,
    Question,
    UsesAbilities,
} from '@serenity-js/core';
import { ElementHandle } from 'playwright';

import { UnsupportedOperationError } from '../../../errors';

/**
 * @package
 */
export class TextOfSingleElement
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<ElementHandle>, Promise<string>>
{
    constructor(protected readonly target: Answerable<ElementHandle>) {
        super(`the text of ${target}`);
    }

    /**
   * @deprecated Use Target.<...>.of()
   */
    of(parent: Answerable<ElementHandle>): Question<Promise<string>> {
        throw new UnsupportedOperationError('Use Target.<...>.of()');
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
        return element.textContent();
    }
}
