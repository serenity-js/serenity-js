import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { CallAnApi } from '../abilities';

/**
 * @desc
 *  Changes the base URL the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
 *  has been configured with. Useful when we don't know the URL before the test is started,
 *  for example when the URL is dynamically generated and needs to be read from the website under test.
 *
 * @example <caption>Changing the API URL</caption>
 * import { Actor } from '@serenity-js/core';
 * import { Navigate, Target, Text } from '@serenity-js/protractor';
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { protractor, by } from 'protractor';
 *
 * import axios  from 'axios';
 *
 * const actor = Actor.named('Apisit').whoCan(
 *     BrowseTheWeb.using(protractor.browser),
 *
 *     // Note: no default base URL is given when the axios instance is created
 *     CallAnApi.using(axios.create()),
 * );
 *
 * // Let's imagine that the website under test displays
 * // a dynamically generated API URL we'd like to use
 * const ApiDetailsWidget = {
 *     Url: Target.the('API URL').located(by.id('api-url')),
 * }
 *
 * actor.attemptsTo(
 *     Navigate.to('/profile'),
 *
 *     // We change the API URL based on the text displayed in the widget
 *     // (although we could change it to some arbitrary string too).
 *     ChangeApiUrl.to(Text.of(ApiDetailsWidget.Url)),
 *
 *     // Any subsequent request will be sent to the newly set URL
 *     Send.a(GetRequest.to('/projects')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 * );
 *
 * @deprecated Use ChangeApiConfig.setUrlTo(newUrl) instead
 *
 * @see {@link ChangeApiConfig}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class ChangeApiUrl extends Interaction {

    /**
     * @desc
     *  Instantiates a new {@link ChangeApiUrl} {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} newApiUrl
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static to(newApiUrl: Answerable<string>): Interaction {
        return new ChangeApiUrl(newApiUrl);
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} newApiUrl
     */
    constructor(private readonly newApiUrl: Answerable<string>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.newApiUrl)
            .then(newApiUrl => CallAnApi.as(actor).modifyConfig(config => config.baseURL = newApiUrl));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString() {
        return `#actor changes the API URL to ${ this.newApiUrl.toString() }`;
    }
}
