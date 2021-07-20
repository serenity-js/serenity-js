import {
    AnswersQuestions,
    Interaction,
    LogicError,
    UsesAbilities,
} from '@serenity-js/core';
import { PageFunction } from 'playwright/types/structs';

import { UnsupportedOperationError } from '../../errors';
import { BrowseTheWeb } from '../abilities';

/**
 * @deprecated For playwright use {@link Execute}
 */
export class ExecuteScript {
    /**
   * @deprecated For playwright use {@link Execute.scriptFrom}
   */
    static from(sourceUrl: string): void {
        throw new UnsupportedOperationError('Use Execute.scriptFrom');
    }

    /**
   * @deprecated For playwright use {@link Execute.script}
   */
    // eslint-disable-next-line @typescript-eslint/ban-types
    static async(script: string | Function): void {
        throw new UnsupportedOperationError('Use Execute.script');
    }

    /**
   * @deprecated For playwright use {@link Execute.script}
   */
    // eslint-disable-next-line @typescript-eslint/ban-types
    static sync(script: string | Function): void {
        throw new UnsupportedOperationError('Use Execute.script');
    }
}

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  execute a script within the context of the current browser window.
 *
 *  Please see the tests below for usage examples.
 *
 * @see {@link LastScriptExecution.result}
 */
export class Execute {
    /**
   * @desc
   *  Instantiates a version of this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  configured to load a script from `sourceUrl`.
   *
   * @param {string} sourceUrl
   *  The URL to load the script from
   *
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    // TODO: implement this
    static scriptFrom(sourceUrl: string): Interaction {
        throw new UnsupportedOperationError('Pending implementation');
        return new ExecuteScriptFromUrl(sourceUrl);
    }

    /**
   * @desc
   *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
   *  execute a synchronous script in the context of the currently selected frame or window.
   *
   *  If the script returns a value, it will be made available via {@link LastScriptExecution.result}.
   *
   * @example <caption>Pressing keys</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, ExecuteScript, LastScriptExecution } from '@serenity-js/playwright';
   *  import { Ensure, includes } from '@serenity-js/assertions';
   *  import { chromium } from 'playwright';
   *
   *  actorCalled('Joseph')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          ExecuteScript.sync('return navigator.userAgent'),
   *          Ensure.that(LastScriptExecution.result<string>(), includes('Chrome')),
   *      );
   *
   * @param {string | Function} script
   *  The script to be executed
   *
   * @returns {ExecuteScriptWithArguments}
   *
   * @see {@link LastScriptExecution.result}
   */
    static script<Argument, R>(
        script: PageFunction<Argument, R>
    ): Interaction & { withArgument(arg: Argument): Interaction } {
    // eslint-disable-line @typescript-eslint/ban-types
        return new EvaluateScript(script);
    }
}

class EvaluateScript<Argument, R> extends Interaction {
    constructor(
        private readonly fun: PageFunction<Argument, R>,
        private readonly arg?: Argument
    ) {
        super();
    }

    public withArgument(arg: Argument): Interaction {
        return new EvaluateScript(this.fun, arg);
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        await actor.abilityTo(BrowseTheWeb).evaluate(this.fun, this.arg);
    }
}

/**
 * @package
 *
 * https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
 */
class ExecuteScriptFromUrl extends Interaction {
    constructor(private readonly sourceUrl: string) {
        super();
    }

    /**
   * @desc
   *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
   *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
   *
   * @param {UsesAbilities & AnswersQuestions} actor
   * @returns {Promise<void>}
   *
   * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
   * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
   * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
   */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<any> {
        try {
            return await BrowseTheWeb.as(actor).evaluate(function (source) {
                // eslint-disable-next-line prefer-rest-params
                const callback = arguments[arguments.length - 1];

                const alreadyLoadedScripts = Array.prototype.slice
          .call(document.querySelectorAll('script'))
          .map((script) => script.src);

                if (-1 !== alreadyLoadedScripts.indexOf(source)) {
                    return callback('Script from ' + source + ' has already been loaded');
                }

                const script = document.createElement('script');
                script.addEventListener('load', function () {
                    return callback();
                });
                script.addEventListener('error', function () {
                    return callback("Couldn't load script from " + this.src);
                });

                script.src = source;
                script.async = true;
                document.head.append(script);
            }, this.sourceUrl);
        } catch (error) {
            throw new LogicError(error);
        }
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return `#actor executes a script from ${this.sourceUrl}`;
    }
}
