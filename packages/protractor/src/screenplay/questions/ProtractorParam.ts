/* eslint-disable unicorn/prevent-abbreviations */
import { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWebWithProtractor } from '../abilities';

/**
 * @desc
 *  Returns a Protractor configuration parameter specified in `protractor.conf.js`.
 *  Note that Protractor configuration parameters can be overridden via the command line.
 *
 * @example <caption>protractor.conf.js</caption>
 *  exports.config = {
 *    params: {
 *        login: {
 *            username: 'jane@example.org'
 *            password: process.env.PASSWORD
 *        }
 *    }
 *    // ...
 *  }
 *
 * @example <caption>Overriding configuration parameter via the command line</caption>
 *  protractor ./protractor.conf.js --params.login.username="bob@example.org"
 *
 * @example <caption>Using as Screenplay Adapter</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWebWithProtractor, ProtractorParam } from '@serenity-js/protractor';
 *  import { Enter } from '@serenity-js/web';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Jane')
 *      .whoCan( BrowseTheWebWithProtractor.using(protractor.browser))
 *      .attemptsTo(
 *          Enter.theValue(ProtractorParam.called('login').username).into(Form.exampleInput),
 *      );
 *
 * @example <caption>Specifying path to param as string</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWebWithProtractor, ProtractorParam } from '@serenity-js/protractor';
 *  import { Enter } from '@serenity-js/web';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Jane')
 *      .whoCan( BrowseTheWebWithProtractor.using(protractor.browser))
 *      .attemptsTo(
 *          Enter.theValue(ProtractorParam.called('login.username')).into(Form.exampleInput),
 *      );
 *
 * @extends {@serenity-js/core/lib/screenplay~Question<Promise<T>>}
 *g
 * @see {@link BrowseTheWebWithProtractor#param}
 */
export class ProtractorParam
{
    /**
     * @desc
     *  Name of the parameter to retrieve. This could also be a dot-delimited path,
     *  i.e. `login.username`
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} name
     * @returns {Question<Promise<R>> & Adapter<R>}
     */
    static called<R>(name: Answerable<string>): QuestionAdapter<R> {
        return Question.about<R>(formatted `the ${ name } param specified in Protractor config`, actor => {
            return actor.answer(name)
                .then(name => (actor.abilityTo(BrowseTheWebWithProtractor) as BrowseTheWebWithProtractor).param(name));
        });
    }
}
