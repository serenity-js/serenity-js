import { Answerable, AnswersQuestions, CollectsArtifacts, d, Interaction, UsesAbilities } from '@serenity-js/core';
import { Name, Photo } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';

/**
 * Instructs an {@link Actor|actor} who has the {@link Ability|ability} to {@link BrowseTheWeb}
 * to take a screenshot and emit an {@link Artifact},
 * which can then be persisted by {@link ArtifactArchiver}
 * and reported by [Serenity BDD reporter](/api/serenity-bdd).
 *
 * #### Taking a screenshot
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core';
 * import { Navigate, TakeScreenshot } from '@serenity-js/protractor';
 *
 * await actorCalled('Tania')
 *   .attemptsTo(
 *     Navigate.to('/app'),
 *     TakeScreenshot.of('my app'),
 *   )
 * ```
 *
 * ## Learn more
 *
 * - {@link BrowseTheWeb}
 * - {@link CollectsArtifacts}
 * - {@link Artifact}
 * - {@link ArtifactArchiver}
 *
 * @group Interactions
 */
export class TakeScreenshot extends Interaction {

    /**
     * Instantiates this {@link Interaction}.
     *
     * @param name
     *  The name to give the emitted {@link Artifact}
     */
    static of(name: Answerable<string>): Interaction {
        return new TakeScreenshot(name);
    }

    protected constructor(private readonly name: Answerable<string>) {
        super();
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        const page          = await BrowseTheWeb.as(actor).currentPage();
        const screenshot    = await page.takeScreenshot();
        const name          = await actor.answer(this.name);

        actor.collect(
            Photo.fromBase64(screenshot),
            new Name(name),
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return d `#actor takes a screenshot of ${this.name}`;
    }
}
