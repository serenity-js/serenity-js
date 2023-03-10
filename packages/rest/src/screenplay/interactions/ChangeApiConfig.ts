import { Answerable, AnswersQuestions, CollectsArtifacts, d, Interaction, LogicError, UsesAbilities } from '@serenity-js/core';
import { URL } from 'url';

import { CallAnApi } from '../abilities';

/**
 * Changes configuration of the {@apilink Ability|ability} to {@apilink CallAnApi}
 * that the {@apilink Actor|actor} executing this {@apilink Interaction|interaction} has been configured with.
 *
 * ## Changing API URL for all subsequent requests
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core';
 * import { By Navigate, PageElement, Text } from '@serenity-js/web';
 * import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions';
 *
 * import * as axios from 'axios';
 *
 * // Let's imagine that the website under test displays
 * // a dynamically generated API URL that we would like to use
 * const ApiDetailsWidget = {
 *   url: () => PageElement.located(By.id('api-url')).describedAs('API URL'),
 * }
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     BrowseTheWeb.using(protractor.browser),
 *
 *     // Note: no default base URL is given when the axios instance is created
 *     CallAnApi.using(axios.create()),
 *   )
 *   .attemptsTo(
 *     Navigate.to('/profile'),
 *
 *     // We change the API URL based on the text displayed in the widget
 *     // (although we could change it to some arbitrary string too).
 *     ChangeApiConfig.setUrlTo(Text.of(ApiDetailsWidget.url())),
 *
 *     // Any subsequent request will be sent to the newly set URL
 *     Send.a(GetRequest.to('/projects')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ## Changing API port for all subsequent requests
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { LocalServer, ManageALocalServer, StartLocalServer } from '@serenity-js/local-server'
 * import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     ManageALocalServer.runningAHttpListener(someServer),
 *     CallAnApi.at('http://localhost'),
 *   )
 *   .attemptsTo(
 *     StartALocalServer.onRandomPort(),
 *     ChangeApiConfig.setPortTo(LocalServer.port()),
 *     Send.a(GetRequest.to('/api')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ## Setting a header for all subsequent requests
 *
 * ```ts
 * import { actorCalled, Question } from '@serenity-js/core'
 * import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * // A sample Question reading a Node process environment variable
 * const EnvVar = (var_name: string) =>
 *     Question.about(`${ name } environment variable`, actor => process.env[var_name]);
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.at('http://localhost'),
 *   )
 *   .attemptsTo(
 *     ChangeApiConfig.setHeader('Authorization', EnvVar('TOKEN')),
 *     Send.a(GetRequest.to('/api')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * @group Activities
 */
export class ChangeApiConfig {

    /**
     * Instructs the {@apilink Actor|actor} to change the base URL
     * of their {@apilink Ability|ability} to {@apilink CallAnApi}
     *
     * @param newApiUrl
     */
    static setUrlTo(newApiUrl: Answerable<string>): Interaction {
        return new ChangeApiConfigSetUrl(newApiUrl);
    }

    /**
     * Instructs the {@apilink Actor|actor} to change the port configured in the base URL
     * of their {@apilink Ability|ability} to {@apilink CallAnApi}
     *
     * @param newApiPort
     */
    static setPortTo(newApiPort: Answerable<number>): Interaction {
        return new ChangeApiConfigSetPort(newApiPort)
    }

    /**
     * Instructs the {@apilink Actor|actor} to change the configuration of the {@apilink AxiosInstance}
     * used by their {@apilink Ability|ability} to {@apilink CallAnApi}
     * and set an HTTP request header for any subsequent {@apilink HTTPRequest|HTTPRequests}
     * issued via {@apilink Send}.
     *
     * @param name
     * @param value
     */
    static setHeader(name: Answerable<string>, value: Answerable<string>): Interaction {
        return new ChangeApiConfigSetHeader(name, value);
    }
}

/**
 * @package
 */
class ChangeApiConfigSetUrl extends Interaction {
    constructor(private readonly newApiUrl: Answerable<string>) {
        super(d`#actor changes API url configuration to ${ newApiUrl }`);
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.newApiUrl)
            .then(newApiUrl => CallAnApi.as(actor).modifyConfig(config => config.baseURL = newApiUrl));
    }
}

/**
 * @package
 */
class ChangeApiConfigSetPort  extends Interaction {
    constructor(private readonly newPort: Answerable<number | string>) {
        super(`#actor changes API port configuration to ${ newPort }`);
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
                catch (error) {
                    throw new LogicError(`Could not change the API port`, error);
                }
            }));
    }
}

/**
 * @package
 *
 * @see https://github.com/axios/axios#custom-instance-defaults
 */
class ChangeApiConfigSetHeader extends Interaction {

    constructor(
        private readonly name: Answerable<string>,
        private readonly value: Answerable<string>
    ) {
        super(`#actor changes API URL and sets header "${ name }" to "${ value }"`);
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return Promise.all([
            actor.answer(this.name),
            actor.answer(this.value),
        ]).
        then(([ name, value ]) => {
            if (! name) {
                throw new LogicError(`Looks like the name of the header is missing, "${ name }" given`);
            }

            // A header with an empty value might still be valid so we don't validate the value
            // see: https://www.w3.org/Protocols/rfc2616/rfc2616-sec2.html#sec2.1

            return CallAnApi.as(actor).modifyConfig(config => {
                config.headers.common[name] = value;
            });
        });
    }
}
