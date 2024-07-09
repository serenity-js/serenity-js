import type { Answerable, AnswersQuestions, CollectsArtifacts, UsesAbilities } from '@serenity-js/core';
import { Interaction, the } from '@serenity-js/core';
import { Name, Photo } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/)
 * who has the [ability](https://serenity-js.org/api/core/class/Ability/)
 * to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to take a screenshot and emit an artifact,
 * which can then be persisted by [`ArtifactArchiver`](https://serenity-js.org/api/core/class/ArtifactArchiver/)
 * and reported by [Serenity BDD reporter](https://serenity-js.org/api/serenity-bdd).
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
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`CollectsArtifacts`](https://serenity-js.org/api/core/interface/CollectsArtifacts/)
 * - [`ArtifactArchiver`](https://serenity-js.org/api/core/class/ArtifactArchiver/)
 *
 * @group Activities
 */
export class TakeScreenshot extends Interaction {

    /**
     * Instantiates this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
     *
     * @param name
     *  The name to give the emitted artifact
     */
    static of(name: Answerable<string>): Interaction {
        return new TakeScreenshot(name);
    }

    protected constructor(private readonly name: Answerable<string>) {
        super(the`#actor takes a screenshot of ${ name }`);
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
