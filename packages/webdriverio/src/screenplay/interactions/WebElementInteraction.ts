import { Answerable, AnswersQuestions, Interaction, LogicError } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

/**
 * @desc
 *  A base class for WebdriverIO-specific interactions
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export abstract class WebElementInteraction extends Interaction {

    /**
     * @param {string} description
     *  A human-readable description to be used when reporting
     *  this {@link @serenity-js/core/lib/screenplay~Interaction}.
     */
    constructor(private readonly description: string) {
        super();
    }

    /**
     * @desc
     *  Returns the resolved {@link @wdio/types~Element}, or throws a {@link @serenity-js/core/lib/errors~LogicError}
     *  if the element is `undefined`.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element<'async'>>} element
     *
     * @returns {Promise<Element<'async'>>}
     *
     * @protected
     */
    protected async resolve(
        actor: AnswersQuestions,
        element: Answerable<Element<'async'>>,
    ): Promise<Element<'async'>> {
        const resolved = await actor.answer(element);

        if (! resolved) {
            throw new LogicError(formatted `Couldn't find ${ element }`);
        }

        return resolved;
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return this.description;
    }
}
