import {
    Answerable,
    AnswersQuestions,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

export class Scroll extends Interaction {
    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {Answerable<ElementHandle>} target
   *  The element to be scroll to
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    static to(target: Answerable<ElementHandle>): Scroll {
        return new Scroll(target);
    }

    /**
   * @param {Answerable<ElementHandle>} target
   *  The element to be scroll to
   */
    protected constructor(
        protected readonly target: Answerable<ElementHandle>,
        protected readonly options?: BasicOptions
    ) {
        super();
    }

    public withOptions(options: BasicOptions): Interaction {
        return new Scroll(this.target, options);
    }

    /**
   * @desc
   *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
   *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {UsesAbilities & AnswersQuestions} actor
   *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
   *
   * @returns {PromiseLike<void>}
   *
   * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
   * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
   * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
   */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await actor.answer(this.target);
        await element.scrollIntoViewIfNeeded(this.options);
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return formatted`#actor scrolls to ${this.target}`;
    }
}
