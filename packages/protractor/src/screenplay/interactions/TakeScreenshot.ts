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

    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): PromiseLike<void> {
        return Promise.all([
            BrowseTheWeb.as(actor).takeScreenshot(),
            actor.answer(this.name),
        ]).then(([ screenshot, name ]) => actor.collect(
            Photo.fromBase64(screenshot),
            new Name(name),
        ));
    }

    toString(): string {
        return formatted `#actor takes a screenshot of ${this.name}`;
    }
}
