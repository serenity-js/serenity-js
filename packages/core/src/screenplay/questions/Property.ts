import { Answerable } from '../Answerable';
import { createMetaQuestionProxy, createQuestionProxy, WithPropertiesAsMetaQuestions, WithPropertiesAsQuestions } from './proxies';

/**
 * @desc
 *  Enables easy access to properties of the value of a given {@link Answerable}.
 *
 * @example <caption>Example API response</caption>
 *  interface EnvironmentDetails {
 *      name: string;
 *      url:  string;
 *  }
 *
 *  interface EnvironmentsResponse {
 *      environments: EnvironmentDetails[];
 *  }
 *
 *  const response: EnvironmentsResponse = {
 *     "environments": [
 *         {
 *             "name": "dev",
 *             "url":  "https://dev.example.com"
 *         },
 *         {
 *             "name": "sit",
 *             "url":  "https://sit.example.com"
 *         }
 *     ]
 *  }
 *
 * @example <caption>Combining Property.of and Property.at</caption>
 *  import { actorCalled, List, Property } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  actorCalled('Lisa').attemptsTo(
 *      Ensure.that(
 *          Property.of(
 *              List.of(response.environments)
 *                  .where(Property.at<EnvironmentDetails>().name, equals('dev'))
 *                  .first(),
 *          ).url,
 *          equals('https://dev.example.com')
 *      )
 *  )
 *
 * @see {@link Question}
 * @see {@link List}
 */
export class Property {

    /**
     * @desc
     *  Generates a {@link Proxy} around a given {@link Answerable} `subject`
     *  to turn the properties of the value it will resolve to into {@link Question}s.
     *
     * @example <caption>Reading a property</caption>
     *  import { actorCalled, Property } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          Property.of(response).environments[0].name,
     *          equals('dev')
     *      )
     *  )
     *
     * @param {Answerable<Subject>} subject
     * @returns {Proxy<Subject>}
     */
    static of<Subject extends object>(subject: Answerable<Subject>): WithPropertiesAsQuestions<Subject> {   // eslint-disable-line @typescript-eslint/ban-types
        return createQuestionProxy<Subject>(subject);
    }

    /**
     * @desc
     *  Generates a {@link Proxy} around a given {@link Answerable} `subject`
     *  to turn any of its properties into {@link MetaQuestion}s
     *  to be used when filtering a {@link List},
     *
     * @example <caption>Reading a property</caption>
     *  import { actorCalled, Property } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          List.of(response.environments)
     *              .where(Property.at<EnvironmentDetails>().name, equals('dev'))
     *              .first(),
     *          equals(response.environments[0])
     *      )
     *  )
     *
     * @returns {Proxy<Subject>}
     */
    static at<Subject extends object>(): WithPropertiesAsMetaQuestions<Subject> {   // eslint-disable-line @typescript-eslint/ban-types
        return createMetaQuestionProxy<Subject>();
    }
}
