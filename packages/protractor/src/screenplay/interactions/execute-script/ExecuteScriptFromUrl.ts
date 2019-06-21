import { AnswersQuestions, Interaction, LogicError, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '../../abilities';

/**
 * @package
 *
 * https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
 */
export class ExecuteScriptFromUrl extends Interaction {
    constructor(private readonly sourceUrl: string) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<any> {
        return BrowseTheWeb.as(actor).executeAsyncScript(`
            var src = arguments[0];
            var callback = arguments[arguments.length - 1];

            var alreadyLoadedScripts = Array.prototype.slice
                .call(document.getElementsByTagName('script'))
                .map(script => script.src);

            if (!! ~ alreadyLoadedScripts.indexOf(src)) {
                return callback("Script from " + src + " has already been loaded");
            }

            var script = document.createElement('script');
            script.onload = function () {
                return callback();
            };
            script.onerror = function () {
                return callback("Couldn't load script from " + this.src);
            };

            script.src = src;
            script.async = true;
            document.head.appendChild(script);
        `, this.sourceUrl).then(errorMessage => {
            if (!! errorMessage) {
                throw new LogicError(errorMessage);
            }
        });
    }

    toString(): string {
        return `#actor executes a script from ${ this.sourceUrl }`;
    }
}
