/* eslint-disable unicorn/filename-case */
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

export class CSSClasses
    extends Question<Promise<string[]>>
    implements MetaQuestion<Answerable<ElementHandle>, Promise<string[]>>
{
    /**
   * @param {Answerable<ElementHandle>} target
   * @returns {CSSClasses}
   */
    static of(target: Answerable<ElementHandle>): CSSClasses {
        return new CSSClasses(target);
    }

    /**
   * @param {Answerable<ElementHandle>} target
   */
    constructor(private readonly target: Answerable<ElementHandle>) {
        super(formatted`CSS classes of ${target}`);
    }

    /**
   * @deprecated Use Target.<...>.of()
   */
    of(parent: Answerable<ElementHandle>): Question<Promise<string[]>> {
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
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const element = await actor.answer(this.target);
        const classes = await actor
      .abilityTo(BrowseTheWeb)
      .evaluate((element_: any) => Array.from(element_.classList), element);
        return classes as string[];
    }
}
