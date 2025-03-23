import type { UsesAbilities } from './abilities';
import { Activity } from './Activity';
import type { Answerable } from './Answerable';
import type { CollectsArtifacts } from './artifacts';
import type { AnswersQuestions } from './questions';

/**
 * **Interactions** are low-level [activities](https://serenity-js.org/api/core/class/Activity/) that encapsulate
 * a handful of instructions for an [actor](https://serenity-js.org/api/core/class/Actor/) on how to use their [abilities](https://serenity-js.org/api/core/class/Ability/)
 * to perform an individual interaction with the given interface of the system under test.
 *
 * :::tip Tasks or interactions?
 * Because of their low-level nature, interactions are named using the vocabulary of the [solution domain](https://blog.mattwynne.net/2013/01/17/the-problem-with-solutions/),
 * and represent an individual interaction with the given interface, e.g. [`Click`](https://serenity-js.org/api/web/class/Click/), [`Enter`](https://serenity-js.org/api/web/class/Enter/), or [`Send`](https://serenity-js.org/api/rest/class/Send/).
 *
 * Interactions follow the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle) which means that they do _one thing and one thing only_.
 * If you're considering implementing an "interaction" that performs more than one logical activity, e.g. checks if the button is visible and then clicks on it if is,
 * consider using separate interactions for separate responsibilities and then composing them using a [task](https://serenity-js.org/api/core/class/Task/).
 * :::
 *
 * Interactions are the core building block of the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern),
 * along with [actors](https://serenity-js.org/api/core/class/Actor/), [abilities](https://serenity-js.org/api/core/class/Ability/), [questions](https://serenity-js.org/api/core/class/Question/), and [tasks](https://serenity-js.org/api/core/class/Task/).
 *
 * ![Screenplay Pattern](https://serenity-js.org/images/design/serenity-js-screenplay-pattern.png)
 *
 * Learn more about:
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * - [Abilities](https://serenity-js.org/api/core/class/Ability/)
 * - [Activities](https://serenity-js.org/api/core/class/Activity/)
 *
 * ## Writing a custom interaction
 *
 * [Serenity/JS modules](https://serenity-js.org/handbook/architecture/) ship with dozens of interactions to help you compose your test scenarios.
 * However, if you need to interact with a non-standard interface, or want to create a flavour of a given interaction that behaves slightly differently than the built-in version,
 * you can easily create your own implementations using the [`Interaction.where`](https://serenity-js.org/api/core/class/Interaction/#where) factory method.
 *
 * ```ts
 * import { Actor, Interaction, the } from '@serenity-js/core'
 * import { BrowseTheWeb, Page } from '@serenity-js/web'
 *
 * export const ClearLocalStorage = () =>
 *   Interaction.where(the`#actor clears local storage`, async (actor: Actor) => {
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
 * @group Screenplay Pattern
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
        description: Answerable<string>,
        interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => Promise<void> | void,
    ): Interaction {
        return new DynamicallyGeneratedInteraction(description, interaction);
    }

    /**
     * Instructs the provided [`Actor`](https://serenity-js.org/api/core/class/Actor/) to perform this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
     *
     * #### Learn more
     * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * - [`PerformsActivities`](https://serenity-js.org/api/core/interface/PerformsActivities/)
     * - [`UsesAbilities`](https://serenity-js.org/api/core/interface/UsesAbilities/)
     * - [`AnswersQuestions`](https://serenity-js.org/api/core/interface/AnswersQuestions/)
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
        description: Answerable<string>,
        private readonly interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => Promise<void> | void,
    ) {
        super(description, Interaction.callerLocation(4));
    }

    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        try {
            return Promise.resolve(this.interaction(actor));
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
