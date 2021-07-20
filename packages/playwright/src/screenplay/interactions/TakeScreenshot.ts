import {
    Answerable,
    AnswersQuestions,
    CollectsArtifacts,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Name, Photo } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';
import { ScreenshotOptions } from '../options/screenshotOptions';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  take a screenshot and emit an {@link @serenity-js/core/lib/model~Artifact},
 *  which can then be persisted by {@link @serenity-js/core/lib/stage/crew/artifact-archiver~ArtifactArchiver}
 *  and reported by [Serenity BDD reporter](/modules/serenity-bdd).
 *
 * @example <caption>Clicking on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Navigate, TakeScreenshot } from '@serenity-js/playwright';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Tania')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          Navigate.to('https://app.example.com/app'),
 *          TakeScreenshot.of('my app'),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
 * @see {@link @serenity-js/core/lib/model~Artifact}
 * @see {@link @serenity-js/core/lib/stage/crew/artifact-archiver~ArtifactArchiver}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class TakeScreenshot extends Interaction {
    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {Answerable<string>} name
   *  The name to associate the screenshot with
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    static of(
        name: Answerable<string>
    ): Interaction & { withOptions(options: ScreenshotOptions): Interaction } {
        return new TakeScreenshot(name);
    }

    /**
   * @param {Answerable<string>} name
   *  The name to associate the screenshot with
   */
    protected constructor(
        private readonly name: Answerable<string>,
        private readonly options?: ScreenshotOptions
    ) {
        super();
    }

    withOptions(options: ScreenshotOptions): Interaction {
        return new TakeScreenshot(this.name, options);
    }

    /**
   * @desc
   *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
   *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {UsesAbilities & AnswersQuestions} actor
   *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
   *
   * @returns {PromiseLike<void>}
   *
   * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
   * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
   * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
   */
    async performAs(
        actor: UsesAbilities & AnswersQuestions & CollectsArtifacts
    ): Promise<void> {
        const [screenshot, name] = await Promise.all([
            BrowseTheWeb.as(actor).takeScreenshot(this.options),
            actor.answer(this.name),
        ]);
        actor.collect(Photo.fromBuffer(screenshot), new Name(name));
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return formatted`#actor takes a screenshot of ${this.name}`;
    }
}
