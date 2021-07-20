import {
    Answerable,
    AnswersQuestions,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';

import { UnsupportedOperationError } from '../../errors';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  remove cookies from the browser.
 *
 * @example <caption>Removing all cookies before each Jasmine test</caption>
 *  import 'jasmine';
 *
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { DeleteCookies } from '@serenity-js/playwright';
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
 *  import { DeleteCookies } from '@serenity-js/playwright';
 *
 *  before(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          DeleteCookies.all(),
 *      ));
 *
 * @example <caption>Removing all cookies before each Cucumber scenario</caption>
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { DeleteCookies } from '@serenity-js/playwright';
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
   * @deprecated Not supported in playwright
   *
   * @desc
   *  Removes a single cookie identified by `cookieName`.
   *
   * @param {Answerable<string>} cookieName
   *  The name of the cookie to be deleted
   *
   * @returns {@link @serenity-js/core/lib/screenplay~Interaction}
   */
    static called(cookieName: Answerable<string>): Interaction {
        throw new UnsupportedOperationError();
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
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const context = await BrowseTheWeb.as(actor).context();
        await context.clearCookies();
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
