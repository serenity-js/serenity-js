import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, LogicError, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Name, TextData } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  execute a script within the context of the current browser window.
 *
 *  Please see the tests below for usage examples.
 *
 * @see {@link LastScriptExecution.result}
 */
export class ExecuteScript {

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
    static from(sourceUrl: string): Interaction {
        return new ExecuteScriptFromUrl(sourceUrl);
    }

    /**
     * @desc
     *  Schedules a command to execute asynchronous JavaScript in the context of the currently selected frame or window.
     *  The script fragment will be executed as the body of an anonymous function.
     *  If the script is provided as a function object, that function will be converted to a string for injection
     *  into the target window.
     *
     *  Any arguments provided in addition to the script will be included as script arguments and may be referenced
     *  using the `arguments` object. Arguments may be a `boolean`, `number`, `string`
     *  or {@link Target} (`Answerable<Element<'async'>>`).
     *  Arrays and objects may also be used as script arguments as long as each item adheres
     *  to the types previously mentioned.
     *
     *  Unlike executing synchronous JavaScript with {@link ExecuteScript#sync},
     *  scripts executed with this function must explicitly signal they are finished by invoking the provided callback.
     *
     *  This callback will always be injected into the executed function as the last argument,
     *  and thus may be referenced with `arguments[arguments.length - 1]`.
     *
     *  If the script invokes the `callback` with a return value, this will be made available
     *  via the {@link LastScriptExecution.result}.
     *
     *  **Please note** that in order to signal an error in the `script` you need to throw an {@link Error}
     *  instead of passing it to the callback function.
     *
     * @example <caption>Executing an async script</caption>
     *  import { ExecuteScript } from '@serenity-js/webdriverio';
     *
     *  actor.attemptsTo(
     *      ExecuteScript.async(`
     *          var callback = arguments[arguments.length - 1];
     *
     *          // do stuff
     *
     *          callback(result)
     *      `)
     *  );
     *
     * @example <caption>Passing arguments to an async script</caption>
     *  import { ExecuteScript } from '@serenity-js/webdriverio';
     *
     *  actor.attemptsTo(
     *      ExecuteScript.async(`
     *          var name = arguments[0];
     *          var age = arguments[1];
     *          var callback = arguments[arguments.length - 1];
     *
     *          // do stuff
     *
     *          callback(result)
     *      `).withArguments('Bob', 24)
     *  );
     *
     * @example <caption>Passing Target arguments to an async script</caption>
     *  import { ExecuteScript } from '@serenity-js/webdriverio';
     *
     *  actor.attemptsTo(
     *      ExecuteScript.async(`
     *          var header = arguments[0];    // Target gets converted to a WebElement
     *          var callback = arguments[arguments.length - 1];
     *
     *          callback(header.innerText)
     *      `).withArguments(Target.the('header').located(by.css('h1')))
     *  );
     *
     * @example <caption>Executing async script as function</caption>
     *  import { ExecuteScript } from '@serenity-js/webdriverio';
     *
     *  actor.attemptsTo(
     *      ExecuteScript.async(function getText(header, callback) {
     *          callback(header.innerText)
     *      }).withArguments(Target.the('header').located(by.css('h1')))
     *  );
     *
     * @param {string | Function} script
     *  The script to be executed
     *
     * @returns {ExecuteScriptWithArguments}
     *
     * @see {@link LastScriptExecution.result}
     */
    static async(script: string | Function): ExecuteScriptWithArguments {   // eslint-disable-line @typescript-eslint/ban-types
        return new ExecuteAsynchronousScript(script);
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
     *  execute a synchronous script in the context of the currently selected frame or window.
     *
     *  If the script returns a value, it will be made available via {@link LastScriptExecution.result}.
     *
     * @example <caption>Executing a sync script as string and reading the result</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, ExecuteScript, LastScriptExecution } from '@serenity-js/webdriverio';
     *  import { Ensure, includes } from '@serenity-js/assertions';
     *
     *  actorCalled('Joseph')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          ExecuteScript.sync('return navigator.userAgent'),
     *          Ensure.that(LastScriptExecution.result<string>(), includes('Chrome')),
     *      );
     *
     * @example <caption>Executing a sync script as function and reading the result</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { by, BrowseTheWeb, Enter, ExecuteScript, LastScriptExecution, Target } from '@serenity-js/webdriverio';
     *
     *  const someOfferField      = Target.the('offer code').located(by.id('offer-code'));
     *  const applyOfferCodeField = Target.the('apply offer field').located(by.id('apply-offer-code'));
     *
     *  actorCalled('Joseph')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          // inject JavaScript to read some property of an element
     *          ExecuteScript.sync(function getValue(element) {
     *              return element.value;
     *          }).withArguments(someOfferField),
     *
     *          // use LastScriptExecution.result() to read the value
     *          // returned from the injected script
     *          // and pass it to another interaction
     *          Enter.theValue(LastScriptExecution.result<string>()).into(applyOfferCodeField),
     *      );
     *
     * @param {string | Function} script
     *  The script to be executed
     *
     * @returns {ExecuteScriptWithArguments}
     *
     * @see {@link LastScriptExecution.result}
     */
    static sync(script: string | Function): ExecuteScriptWithArguments {    // eslint-disable-line @typescript-eslint/ban-types
        return new ExecuteSynchronousScript(script);
    }
}

/**
 * @desc
 *  Allows for a script to be executed to be parametrised.
 *
 *  **Please note** that the arguments can be both synchronous and asynchronous {@link @serenity-js/core/lib/screenplay~Question}s
 *  as well as regular static values.
 *
 * @abstract
 *
 * @see {@link ExecuteScript}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export abstract class ExecuteScriptWithArguments extends Interaction {

    /**
     * @param {string | Function} script
     *  The script to be executed
     *
     * @param {Array<Answerable<any>>} args
     *  Arguments to parametrise the script with
     */
    constructor(
        protected readonly script: string | Function,           // eslint-disable-line @typescript-eslint/ban-types
        protected readonly args: Array<Answerable<any>> = [],
    ) {
        super();
    }

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Enter}.
     *
     * @param {...Array<Answerable<any>>} args
     *  Arguments to parametrise the script with
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    public abstract withArguments(...args: Array<Answerable<any>>): Interaction;

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
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): PromiseLike<void> {
        return Promise.all(this.args.map(arg => actor.answer(arg)))
            .then(args => this.executeAs(actor, args))
            .then(() => actor.collect(
                TextData.fromJSON({
                    contentType:    'text/javascript;charset=UTF-8',
                    data:           this.script.toString(),
                }),
                new Name('Script source'),
            ));
    }

    protected abstract executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any>;
}

/**
 * @package
 */
class ExecuteAsynchronousScript extends ExecuteScriptWithArguments {
    withArguments(...args: Array<Answerable<any>>): Interaction {
        return new ExecuteAsynchronousScript(this.script, args);
    }

    protected executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any> {
        return BrowseTheWeb.as(actor).executeAsyncScript(this.script as unknown as any, ...args);   // todo: fix types
    }

    toString(): string {
        return this.args.length > 0
            ? formatted `#actor executes an asynchronous script with arguments: ${ this.args }`
            : `#actor executes an asynchronous script`;
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
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<any> {
        return BrowseTheWeb.as(actor)
            .browser.executeAsync(
                /* istanbul ignore next */
                function executeScriptFromUrl(sourceUrl: string, callback: (message?: string) => void) {
                    const alreadyLoadedScripts = Array.prototype.slice
                            .call(document.querySelectorAll('script'))
                            .map(script => script.src);

                    if (~ alreadyLoadedScripts.indexOf(sourceUrl)) {
                        return callback('Script from ' + sourceUrl + ' has already been loaded');
                    }

                    const script = document.createElement('script');
                    script.addEventListener('load', function() {
                        callback();
                    });
                    script.addEventListener('error', function () {
                        return callback('Couldn\'t load script from ' + sourceUrl);
                    });

                    script.src = sourceUrl;
                    script.async = true;
                    document.head.append(script);
                },
                this.sourceUrl
            )
            .then(errorMessage => {
                if (errorMessage) {
                    throw new LogicError(errorMessage);
                }
            });
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor executes a script from ${ this.sourceUrl }`;
    }
}

/**
 * @package
 */
class ExecuteSynchronousScript extends ExecuteScriptWithArguments {

    withArguments(...args: Array<Answerable<any>>): Interaction {
        return new ExecuteSynchronousScript(this.script, args);
    }

    protected executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any> {
        return BrowseTheWeb.as(actor).executeScript(this.script as unknown as any, ...args);    // todo fix type
    }

    toString(): string {
        return this.args.length > 0
            ? formatted `#actor executes a synchronous script with arguments: ${ this.args }`
            : `#actor executes a synchronous script`;
    }
}
