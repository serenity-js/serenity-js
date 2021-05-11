/* eslint-disable unicorn/prevent-abbreviations */
import { Answerable, AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { BrowseTheWeb } from '../abilities';

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
 * }
 *
 * @example <caption>Overriding configuration parameter via the command line</caption>
 *  protractor ./protractor.conf.js --params.login.username="bob@example.org"
 *
 * @example <caption>Using in a test scenario</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Enter, ProtractorParam } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Jane')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Enter.theValue(ProtractorParam.called('login.username').into(Form.exampleInput),
 *      );
 *
 * @extends {@serenity-js/core/lib/screenplay~Question<Promise<T>>}
 *
 * @see {@link BrowseTheWeb#param}
 */
export class ProtractorParam<T = any>
    extends Question<Promise<T>>
{
    /**
     * @desc
     *  Name of the parameter to retrieve. This could also be a dot-delimited path,
     *  i.e. `login.username`
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} name
     * @returns {ProtractorParam<R>}
     */
    static called<R>(name: Answerable<string>): ProtractorParam {
        return new ProtractorParam<R>(name);
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} name
     */
    constructor(private readonly name: Answerable<string>) {
        super(formatted `the ${ name } param specified in Protractor config`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<T> {
        return actor.answer(this.name)
            .then(name => BrowseTheWeb.as(actor).param(name));
    }
}
