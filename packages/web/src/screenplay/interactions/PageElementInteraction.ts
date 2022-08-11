import { Answerable, AnswersQuestions, d, Interaction, LogicError } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * A base class for interactions with {@link PageElement} objects.
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
     *  this {@link Interaction}.
     */
    protected constructor(private readonly description: string) {
        super();
    }

    /**
     * Returns the resolved {@link PageElement}, or throws a {@link LogicError}
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
