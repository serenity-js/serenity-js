import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, Log, LogicError, UsesAbilities } from '@serenity-js/core';
import { URL } from 'url';
import { CallAnApi } from '../abilities';

/**
 * @desc
 *  Changes configuration of the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
 *  the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  executing this {@link @serenity-js/core/lib/screenplay~Interaction} has been configured with.
 *
 * @example <caption>Changing API URL</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { Navigate, Target, Text } from '@serenity-js/protractor';
 *  import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { protractor, by } from 'protractor';
 *
 *  import axios  from 'axios';
 *
 *  const actor = Actor.named('Apisit').whoCan(
 *      BrowseTheWeb.using(protractor.browser),
 *
 *      // Note: no default base URL is given when the axios instance is created
 *      CallAnApi.using(axios.create()),
 *  );
 *
 *  // Let's imagine that the website under test displays
 *  // a dynamically generated API URL we'd like to use
 *  const ApiDetailsWidget = {
 *      Url: Target.the('API URL').located(by.id('api-url')),
 *  }
 *
 *  actor.attemptsTo(
 *      Navigate.to('/profile'),
 *
 *      // We change the API URL based on the text displayed in the widget
 *      // (although we could change it to some arbitrary string too).
 *      ChangeApiConfig.setUrlTo(Text.of(ApiDetailsWidget.Url)),
 *
 *      // Any subsequent request will be sent to the newly set URL
 *      Send.a(GetRequest.to('/projects')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *  );
 *
 * @example <caption>Changing API port</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { LocalServer, ManageALocalServer, StartLocalServer } from '@serenity-js/local-server';
 *  import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *
 *  const actor = Actor.named('Apisit').whoCan(
 *      ManageALocalServer.runningAHttpListener(someServer),
 *      CallAnApi.at(http://localhost),
 *  );
 *
 *  actor.attemptsTo(
 *     StartALocalServer.onRandomPort(),
 *     ChangeApiConfig.setPortTo(LocalServer.port()),
 *     Send.a(GetRequest.to('/api')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *  );
 */
export class ChangeApiConfig {

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to change the base URL of their {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} newApiUrl
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static setUrlTo(newApiUrl: Answerable<string>): Interaction {
        return new ChangeApiConfigSetUrl(newApiUrl);
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to change the port configured in the base URL of their {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} newApiPort
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static setPortTo(newApiPort: Answerable<number>): Interaction {
        return new ChangeApiConfigSetPort(newApiPort)
    }
}

/**
 * @package
 */
class ChangeApiConfigSetUrl extends Interaction {
    constructor(private readonly newApiUrl: Answerable<string>) {
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.newApiUrl)
            .then(newApiUrl => CallAnApi.as(actor).modifyConfig(config => config.baseURL = newApiUrl));
    }

    toString() {
        return `#actor changes API URL configuration to ${ this.newApiUrl }`;
    }
}

/**
 * @package
 */
class ChangeApiConfigSetPort  extends Interaction {
    constructor(private readonly newPort: Answerable<number | string>) {
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.newPort)
            .then(newPort => CallAnApi.as(actor).modifyConfig(config => {
                if (! config.baseURL) {
                    throw new LogicError(`Can't change the port of a baseURL that has not been set.`)
                }

                try {
                    const newUrl = new URL(config.baseURL);
                    newUrl.port = `${ newPort }`;
                    config.baseURL = newUrl.toString();
                }
                catch (e) {
                    throw new LogicError(`Could not change the API port`, e);
                }
            }));
    }

    toString() {
        return `#actor changes API port configuration to ${ this.newPort }`;
    }
}

