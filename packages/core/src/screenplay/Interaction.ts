import { Activity } from './Activity';
import { Actor, AnswersQuestions, CollectsArtifacts, UsesAbilities } from './actor';

/**
 * Serenity/JS Screenplay Pattern `Interaction` is a low-level {@apilink Activity|activity} that directly
 * uses the {@apilink Actor|actor's} {@apilink Ability|ability} to interact
 * with the system under test.
 *
 * Use the factory method `Interaction.where(description, interactionFunction)` to define custom interactions.
 *
 * ## Defining a custom interaction
 *
 * ```ts
 * import { Actor, Interaction } from '@serenity-js/core'
 * import { BrowseTheWeb, Page } from '@serenity-js/web'
 *
 * export const ClearLocalStorage = () =>
 *   Interaction.where(`#actor clears local storage`, async (actor: Actor) => {
 *     // Interaction to ClearLocalStorage directly uses Actor's ability to BrowseTheWeb
 *     const page: Page = await BrowseTheWeb.as(actor).currentPage()
 *     await page.executeScript(() => window.localStorage.clear())
 *   })
 * ```
 *
 * ## Using a custom interaction
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core';
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { By, Navigate, PageElement } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { Browser, chromium } from 'playwright'
 *
 * const browser = await chromium.launch({ headless: true })
 *
 * await actorCalled('Inês')
 *   .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *   .attemptsTo(
 *     Navigate.to(`https://serenity-js.org`),
 *     ClearLocalStorage(), // reported as "Inês clears local storage"
 *   )
 * ```
 *
 * @group Activities
 */
export abstract class Interaction extends Activity {

    /**
     * @param description
     *  Description to be used when reporting this interaction, for example `#actor clears local storage`.
     *  Note that `#actor` will be replaced with the name of the actor performing this interaction.
     *
     * @param interaction
     */
    static where(
        description: string,
        interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => Promise<void> | void,
    ): Interaction {
        return new DynamicallyGeneratedInteraction(description, interaction);
    }

    /**
     * Instructs the provided {@apilink Actor} to perform this {@apilink Interaction}.
     *
     * #### Learn more
     * - {@apilink Actor}
     * - {@apilink PerformsActivities}
     * - {@apilink UsesAbilities}
     * - {@apilink AnswersQuestions}
     *
     * @param actor
     */
    abstract performAs(actor: UsesAbilities & AnswersQuestions): Promise<void>;
}

/**
 * @package
 */
class DynamicallyGeneratedInteraction extends Interaction {
    constructor(
        description: string,
        private readonly interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => Promise<void> | void,
    ) {
        super(description, Interaction.callerLocation(4));
    }

    performAs(actor: Actor): Promise<void> {
        try {
            return Promise.resolve(this.interaction(actor));
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
