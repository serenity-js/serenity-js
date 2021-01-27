import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, Log, LogicError, UsesAbilities } from '@serenity-js/core';
import { URL } from 'url';
import { CallAnApi } from '../abilities';

/**
 * @desc
 *  Changes configuration of the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
 *  the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  executing this {@link @serenity-js/core/lib/screenplay~Interaction} has been configured with.
 *
 * @example <caption>Changing API URL for all subsequent requests</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Navigate, Target, Text } from '@serenity-js/protractor';
 *  import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { protractor, by } from 'protractor';
 *
 *  import axios from 'axios';
 *
 *  const actor = actorCalled('Apisitt').whoCan(
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
 * @example <caption>Changing API port for all subsequent requests</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { LocalServer, ManageALocalServer, StartLocalServer } from '@serenity-js/local-server';
 *  import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = actorCalled('Apisitt').whoCan(
 *      ManageALocalServer.runningAHttpListener(someServer),
 *      CallAnApi.at('http://localhost'),
 *  );
 *
 *  actor.attemptsTo(
 *      StartALocalServer.onRandomPort(),
 *      ChangeApiConfig.setPortTo(LocalServer.port()),
 *      Send.a(GetRequest.to('/api')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *  );
 *
 * @example <caption>Setting a header for all subsequent requests</caption>
 *  import { actorCalled, Question } from '@serenity-js/core';
 *  import { CallAnApi, ChangeApiConfig, GetRequest, LastResponse, Send } from '@serenity-js/rest';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = actorCalled('Apisitt').whoCan(
 *      CallAnApi.at('http://localhost'),
 *  );
 *
 *  // A sample Question reading Node process environment variable
 *  const EnvVar = (var_name: string) =>
 *      Question.about(`${ name } environment variable`, actor => process.env[var_name]);
 *
 *  actor.attemptsTo(
 *      ChangeApiConfig.setHeader('Authorization', EnvVar('TOKEN')),
 *      Send.a(GetRequest.to('/api')),
 *      Ensure.that(LastResponse.status(), equals(200)),
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

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to modify the configuration of the {@link AxiosInstance}
     *  used by {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
     *  and set a HTTP request header for any subsequent {@link HTTPRequest}
     *  issued via {@link Send}.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} name
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} value
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
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
        super();
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

    toString() {
        return `#actor changes API URL and sets header "${ this.name }" to "${ this.value }"`;
    }
}
