import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  remove cookies from the browser.
 *
 * @example <caption>Removing a single cookie</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Navigate, DeleteCookies } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Sid')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Navigate.to('/login'),
 *          DeleteCookies.called('jwt_token'),
 *          Navigate.reloadPage(),
 *      );
 *
 * @example <caption>Removing all cookies before each Jasmine test</caption>
 *  import 'jasmine';
 *
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { DeleteCookies } from '@serenity-js/protractor';
 *
 *  before(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          DeleteCookies.all(),
 *      ));
 *
 * @example <caption>Removing all cookies before each Mocha test</caption>
 *  import 'mocha';
 *
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { DeleteCookies } from '@serenity-js/protractor';
 *
 *  before(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          DeleteCookies.all(),
 *      ));
 *
 * @example <caption>Removing all cookies before each Cucumber scenario</caption>
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { DeleteCookies } from '@serenity-js/protractor';
 *  import { Before } from 'cucumber';
 *
 *  Before(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          DeleteCookies.all(),
 *      ));
 *
 * @see {@link Navigate}
 */
export class DeleteCookies {

    /**
     * @desc
     *  Removes a single cookie identified by `cookieName`.
     *
     * @param {Answerable<string>} cookieName
     *  The name of the cookie to be deleted
     *
     * @returns {@link @serenity-js/core/lib/screenplay~Interaction}
     */
    static called(cookieName: Answerable<string>): Interaction {
        return new DeleteCookieCalled(cookieName);
    }

    /**
     * @desc
     *  Removes any cookies set.
     *
     * @returns {@link @serenity-js/core/lib/screenplay~Interaction}
     */
    static all(): Interaction {
        return new DeletesAllCookies();
    }
}

/**
 * @package
 */
class DeleteCookieCalled implements Interaction {
    constructor(private readonly name: Answerable<string>) {
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
     *
     * @returns {PromiseLike<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return actor.answer(this.name)
            .then(name => BrowseTheWeb.as(actor).manage().deleteCookie(name));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor deletes the "${ this.name }" cookie`;
    }
}

/**
 * @package
 */
class DeletesAllCookies implements Interaction {

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
     *
     * @returns {PromiseLike<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).manage().deleteAllCookies());
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor deletes all cookies`;
    }
}
