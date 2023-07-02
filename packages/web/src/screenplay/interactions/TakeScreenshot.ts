import type { Answerable, AnswersQuestions, CollectsArtifacts, UsesAbilities } from '@serenity-js/core';
import { d, Interaction } from '@serenity-js/core';
import { Name, Photo } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';

/**
 * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * to take a screenshot and emit an {@apilink Artifact},
 * which can then be persisted by {@apilink ArtifactArchiver}
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
 * - {@apilink BrowseTheWeb}
 * - {@apilink CollectsArtifacts}
 * - {@apilink Artifact}
 * - {@apilink ArtifactArchiver}
 *
 * @group Activities
 */
export class TakeScreenshot extends Interaction {

    /**
     * Instantiates this {@apilink Interaction}.
     *
     * @param name
     *  The name to give the emitted {@apilink Artifact}
     */
    static of(name: Answerable<string>): Interaction {
        return new TakeScreenshot(name);
    }

    protected constructor(private readonly name: Answerable<string>) {
        super(d`#actor takes a screenshot of ${ name }`);
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
}
