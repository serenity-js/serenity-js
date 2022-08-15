/* eslint-disable unicorn/prevent-abbreviations */
import { Answerable, d, Question, QuestionAdapter } from '@serenity-js/core';

import { BrowseTheWebWithProtractor } from '../abilities';

/**
 * Returns a Protractor configuration parameter specified in `protractor.conf.js`
 * and identified by name. Protractor configuration parameters can be overridden via the command line.
 *
 * **Warning:** this question is Protractor-specific, so using it in your tests
 * will reduce their portability across test integration tools.
 *
 * ```js
 * // protractor.conf.js
 * exports.config = {
 *   params: {
 *     login: {
 *       username: 'jane@example.org'
 *       password: process.env.PASSWORD
 *     }
 *   }
 *   // ...
 * }
 * ```
 *
 * ## Overriding configuration parameter using the command line
 *
 * ```shell
 * npx protractor ./protractor.conf.js --params.login.username="bob@example.org"
 * ```
 *
 * ## Using as `QuestionAdapter`
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithProtractor, ProtractorParam } from '@serenity-js/protractor'
 * import { Enter } from '@serenity-js/web'
 * import { protractor } from 'protractor'
 *
 * await actorCalled('Jane')
 *   .whoCan( BrowseTheWebWithProtractor.using(protractor.browser))
 *   .attemptsTo(
 *     Enter.theValue(ProtractorParam.called('login').username).into(Form.exampleInput),
 *   )
 * ```
 *
 * ## Specifying path to param as string
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithProtractor, ProtractorParam } from '@serenity-js/protractor'
 * import { Enter } from '@serenity-js/web'
 * import { protractor } from 'protractor
 *
 * await actorCalled('Jane')
 *   .whoCan(BrowseTheWebWithProtractor.using(protractor.browser))
 *   .attemptsTo(
 *     Enter.theValue(ProtractorParam.called('login.username')).into(Form.exampleInput),
 *   );
 * ```
 *
 * ## Learn more
 * - {@apilink BrowseTheWebWithProtractor.param}
 *
 * @group Questions
 */
export class ProtractorParam
{
    /**
     * Name of the parameter to retrieve. This could also be a dot-delimited path,
     * e.g. `login.username`
     *
     * @param name
     */
    static called<Return_Type>(name: Answerable<string>): QuestionAdapter<Return_Type> {
        return Question.about<Return_Type>(d`the ${ name } param specified in Protractor config`, async actor => {
            const paramName = await actor.answer(name);
            const browseTheWeb = BrowseTheWebWithProtractor.as(actor) as BrowseTheWebWithProtractor;

            return browseTheWeb.param<Return_Type>(paramName);
        });
    }
}
