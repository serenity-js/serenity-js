import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Name, Photo } from '@serenity-js/core/lib/model';
import { BrowseTheWeb } from '../abilities';

export class TakeScreenshot extends Interaction {
    static of(name: Answerable<string>): Interaction {
        return new TakeScreenshot(name);
    }

    constructor(private readonly name: Answerable<string>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions & CollectsArtifacts} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
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
