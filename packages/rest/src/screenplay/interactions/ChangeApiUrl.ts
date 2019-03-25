import { AnswersQuestions, CollectsArtifacts, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { CallAnApi } from '../abilities';

export class ChangeApiUrl extends Interaction {
    static to(newApiUrl: KnowableUnknown<string>): Interaction {
        return new ChangeApiUrl(newApiUrl);
    }

    constructor(private readonly newApiUrl: KnowableUnknown<string>) {
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.newApiUrl)
            .then(newApiUrl => CallAnApi.as(actor).modifyConfig(config => config.baseURL = newApiUrl));
    }

    toString() {
        return `#actor changes the API URL to ${ this.newApiUrl.toString() }`;
    }
}
