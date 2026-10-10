import type { Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { d, Duration, Interaction, ListItemNotFoundError, LogicError, ScheduleWork, TimeoutExpiredError } from '@serenity-js/core';
import type { FileSystemLocation } from '@serenity-js/core/io';

import type { PageElement } from '../models/index.js';

/**
 * A base class for interactions with [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) objects.
 *
 * **Note:** The recommended way to implement custom interactions
 * in your code is to use the [`Interaction.where`](https://serenity-js.org/api/core/class/Interaction/#where) factory method.
 *
 * @group Activities
 */
export abstract class PageElementInteraction extends Interaction {

    protected constructor(description: Answerable<string>, location: FileSystemLocation = Interaction.callerLocation(4)) {
        super(description, location);
    }

    /**
     * Returns the resolved [`PageElement`](https://serenity-js.org/api/web/class/PageElement/), or throws a [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     * if the element is `undefined`.
     *
     * If the element is retrieved from a list of [`PageElements`](https://serenity-js.org/api/web/class/PageElements/),
     * for example using `PageElements.located(…).where(…).first()`, and the list doesn't contain a matching item yet,
     * this method keeps retrying until the item becomes available or the [interaction timeout](https://serenity-js.org/api/core/class/SerenityConfig/#interactionTimeout) expires.
     * This allows for the list to be populated asynchronously, for example, when the page is still rendering.
     *
     * @param actor
     * @param element
     */
    protected async resolve(
        actor: AnswersQuestions,
        element: Answerable<PageElement>,
    ): Promise<PageElement> {
        const resolved = await this.answerWhenAvailable(actor, element);

        if (! resolved) {
            throw new LogicError(d `Couldn't find ${ element }`);
        }

        return resolved;
    }

    private async answerWhenAvailable(
        actor: AnswersQuestions,
        element: Answerable<PageElement>,
    ): Promise<PageElement> {
        try {
            // Common case: the element is available straight away, so there's no need to schedule any retries
            return await actor.answer(element);
        }
        catch (error) {
            if (! (error instanceof ListItemNotFoundError) || ! canScheduleWork(actor)) {
                throw error;
            }

            let lastError: ListItemNotFoundError = error;

            return await ScheduleWork.as(actor).repeatUntil<PageElement>(
                () => actor.answer(element),
                {
                    exitCondition: () => true,

                    // Retry quickly at first, then back off
                    delayBetweenInvocations: invocation => Duration.ofMilliseconds(
                        Math.min(2 ** invocation * 10, 500)
                    ),

                    errorHandler: retryError => {
                        if (retryError instanceof ListItemNotFoundError) {
                            lastError = retryError;
                            return;  // ignore, the list might get populated later
                        }

                        if (retryError instanceof TimeoutExpiredError) {
                            throw lastError;
                        }

                        throw retryError;
                    },
                },
            );
        }
    }
}

/**
 * Actors instantiated by Serenity/JS can always schedule work,
 * but custom implementations of `AnswersQuestions` might not.
 */
function canScheduleWork(actor: AnswersQuestions): actor is AnswersQuestions & UsesAbilities {
    const maybeActor = actor as Partial<UsesAbilities & { hasAbilityTo(type: typeof ScheduleWork): boolean }>;

    return typeof maybeActor.abilityTo === 'function'
        && typeof maybeActor.hasAbilityTo === 'function'
        && maybeActor.hasAbilityTo(ScheduleWork);
}
