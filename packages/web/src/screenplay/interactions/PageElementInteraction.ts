import { Answerable, AnswersQuestions, d, Interaction, LogicError } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * A base class for interactions with {@apilink PageElement} objects.
 *
 * **Note:** The recommended way to implement custom interactions
 * in your code is to use the {@apilink Interaction.where} factory method.
 *
 * @group Interactions
 */
export abstract class PageElementInteraction extends Interaction {

    /**
     * @param description
     *  A human-readable description to be used when reporting
     *  this {@apilink Interaction}.
     */
    protected constructor(private readonly description: string) {
        super();
    }

    /**
     * Returns the resolved {@apilink PageElement}, or throws a {@apilink LogicError}
     * if the element is `undefined`.
     *
     * @param actor
     * @param element
     */
    protected async resolve(
        actor: AnswersQuestions,
        element: Answerable<PageElement>,
    ): Promise<PageElement> {
        const resolved = await actor.answer(element);

        if (! resolved) {
            throw new LogicError(d `Couldn't find ${ element }`);
        }

        return resolved;
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.description;
    }
}
