import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Name, Photo } from '@serenity-js/core/lib/model';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  take a screenshot and emit an {@link @serenity-js/core/lib/model~Artifact},
 *  which can then be persisted by {@link @serenity-js/core/lib/stage/crew/artifact-archiver~ArtifactArchiver}
 *  and reported by [Serenity BDD reporter](/modules/serenity-bdd).
 *
 * @example <caption>Clicking on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Navigate, TakeScreenshot } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Tania')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Navigate.to('/app'),
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
    static of(name: Answerable<string>): Interaction {
        return new TakeScreenshot(name);
    }

    /**
     * @param {Answerable<string>} name
     *  The name to associate the screenshot with
     */
    constructor(private readonly name: Answerable<string>) {
        super();
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
    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): PromiseLike<void> {
        return Promise.all([
            BrowseTheWeb.as(actor).takeScreenshot(),
            actor.answer(this.name),
        ]).then(([ screenshot, name ]) => actor.collect(
            Photo.fromBase64(screenshot),
            new Name(name),
        ));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor takes a screenshot of ${this.name}`;
    }
}
