import {
    Answerable,
    AnswersQuestions,
    Question,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

export class Attribute extends Question<Promise<string>> {
    /**
   * @deprecated Use Attribute.called(name).of(target)
   *
   * @param {Answerable<ElementHandle>} target
   * @returns
   */
    static of(target: Answerable<ElementHandle>): { called: (name: Answerable<string>) => Attribute; } {
        return {
            called: (name: Answerable<string>) => new Attribute(target, name),
        };
    }

    /**
   * @param {Answerable<string>} name of attribute
   * @returns {{ of(Answerable<ElementHandle>): Attribute }}
   */
    static called(name: Answerable<string>): {
        /**
      * @param {Answerable<ElementHandle>} target
      * @returns {Attribute}
      */
        of: (target: Answerable<ElementHandle>) => Attribute;
    } {
        return {
            /**
       * @param {Answerable<ElementHandle>} target
       * @returns {Attribute}
       */
            of: (target: Answerable<ElementHandle>) => new Attribute(target, name),
        };
    }

    protected constructor(
        private readonly target: Answerable<ElementHandle>,
        private readonly name: Answerable<string>
    ) {
        super(formatted`the value of the ${name} attribute of ${target}`);
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
        const name = await actor.answer(this.name);
        return element.getAttribute(name);
    }
}
