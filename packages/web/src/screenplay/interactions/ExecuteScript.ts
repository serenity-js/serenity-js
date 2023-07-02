import type { Answerable, AnswersQuestions, CollectsArtifacts, UsesAbilities } from '@serenity-js/core';
import { f, Interaction, LogicError } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';
import { Name, TextData } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';

/**
 * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * to execute a script within the context of the current browser tab.
 *
 * ## Learn more
 *
 * - {@apilink BrowseTheWeb}
 * - {@apilink LastScriptExecution.result}
 *
 * @group Activities
 */
export class ExecuteScript {

    /**
     * Instantiates a version of this {@apilink Interaction}
     * configured to load a script from `sourceUrl`.
     *
     * @param sourceUrl
     *  The URL to load the script from
     */
    static from(sourceUrl: Answerable<string>): Interaction {
        return new ExecuteScriptFromUrl(sourceUrl);
    }

    /**
     * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
     * to execute an asynchronous script within the context of the current browser tab.
     *
     * The script fragment will be executed as the body of an anonymous function.
     * If the script is provided as a function object, that function will be converted to a string for injection
     * into the target window.
     *
     * Any arguments provided in addition to the script will be included as script arguments and may be referenced
     * using the `arguments` object. Arguments may be a `boolean`, `number`, `string`
     * or {@apilink PageElement}.
     * Arrays and objects may also be used as script arguments as long as each item adheres
     * to the types previously mentioned.
     *
     * Unlike executing synchronous JavaScript with {@apilink ExecuteScript.sync},
     * scripts executed with this function must explicitly signal they are finished by invoking the provided callback.
     *
     * This callback will always be injected into the executed function as the last argument,
     * and thus may be referenced with `arguments[arguments.length - 1]`.
     *
     * If the script invokes the `callback` with a return value, this will be made available
     * via the {@apilink LastScriptExecution.result}.
     *
     * **Please note** that in order to signal an error in the `script` you need to throw an {@apilink Error}
     * instead of passing it to the callback function.
     *
     * #### Executing an async script
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript } from '@serenity-js/web'
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(`
     *     var callback = arguments[arguments.length - 1]
     *
     *     // do stuff
     *
     *     callback(result)
     *   `)
     * )
     * ```
     *
     * #### Passing arguments to an async script
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript } from '@serenity-js/web'
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(`
     *     var name = arguments[0];
     *     var age = arguments[1];
     *     var callback = arguments[arguments.length - 1]
     *
     *     // do stuff
     *
     *     callback(result)
     *   `).withArguments('Bob', 24)
     * )
     * ```
     *
     * #### Passing Target arguments to an async script
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript } from '@serenity-js/web'
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(`
     *     var header = arguments[0]        // PageElement object gets converted to a WebElement
     *     var callback = arguments[arguments.length - 1]
     *
     *     callback(header.innerText)
     *   `).withArguments(PageElement.located(By.css('h1')).describedAs('header'))
     * )
     * ```
     *
     * #### Executing async script as function
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript } from '@serenity-js/web'
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(function getText(header, callback) {
     *     callback(header.innerText)
     *   }).withArguments(PageElement.located(By.css('h1')).describedAs('header'))
     * )
     * ```
     *
     * #### Learn more
     * - {@apilink LastScriptExecution.result}
     *
     * @param script
     *  The script to be executed
     */
    static async(script: string | Function): ExecuteScriptWithArguments {   // eslint-disable-line @typescript-eslint/ban-types
        return new ExecuteAsynchronousScript(
            `#actor executes an asynchronous script`,
            script,
        );
    }

    /**
     * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
     * to execute a synchronous script within the context of the current browser tab.
     *
     * If the script returns a value, it will be made available via {@apilink LastScriptExecution.result}.
     *
     * #### Executing a sync script as string and reading the result
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript, LastScriptExecution } from '@serenity-js/web'
     * import { Ensure, includes } from '@serenity-js/assertions'
     *
     * await actorCalled('Joseph')
     *   .attemptsTo(
     *     ExecuteScript.sync('return navigator.userAgent'),
     *     Ensure.that(LastScriptExecution.result<string>(), includes('Chrome')),
     *   )
     * ```
     *
     * #### Executing a sync script as function and reading the result
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { By, Enter, ExecuteScript, LastScriptExecution, PageElement } from '@serenity-js/web'
     *
     * const someOfferField = () =>
     *   PageElement.located(By.id('offer-code'))
     *     .describedAs('offer code')
     *
     * const applyOfferCodeField = () =>
     *   PageElement.located(By.id('apply-offer-code'))
     *     .describedAs('apply offer field')
     *
     * await actorCalled('Joseph')
     *   .attemptsTo(
     *     // inject JavaScript to read some property of an element
     *     ExecuteScript.sync(function getValue(element) {
     *         return element.value;
     *     }).withArguments(someOfferField),
     *
     *     // use LastScriptExecution.result() to read the value
     *     // returned from the injected script
     *     // and pass it to another interaction
     *     Enter.theValue(LastScriptExecution.result<string>()).into(applyOfferCodeField),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink LastScriptExecution.result}
     *
     * @param script
     *  The script to be executed
     */
    static sync(script: string | Function): ExecuteScriptWithArguments {    // eslint-disable-line @typescript-eslint/ban-types
        return new ExecuteSynchronousScript(
            `#actor executes a synchronous script`,
            script,
        );
    }
}

/**
 * Allows for a script to be executed to be parametrised.
 *
 * ## Learn more
 * -  {@apilink ExecuteScript}
 *
 * @group Activities
 */
export abstract class ExecuteScriptWithArguments extends Interaction {

    constructor(
        description: string,
        protected readonly script: string | Function,           // eslint-disable-line @typescript-eslint/ban-types
        protected readonly args: Array<Answerable<any>> = [],
    ) {
        super(description, Interaction.callerLocation(5));
    }

    /**
     * Instantiates this {@apilink Interaction}
     *
     * @param args
     *  Arguments to parametrise the script with
     */
    public abstract withArguments(...args: Array<Answerable<any>>): Interaction;

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        const args = await asyncMap(this.args, arg => actor.answer(arg));

        await this.executeAs(actor, args);

        actor.collect(
            TextData.fromJSON({
                contentType:    'text/javascript;charset=UTF-8',
                data:           this.script.toString(),
            }),
            new Name('Script source'),
        );
    }

    protected abstract executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any>;
}

/**
 * @package
 */
class ExecuteAsynchronousScript extends ExecuteScriptWithArguments {
    withArguments(...args: Array<Answerable<any>>): Interaction {
        return new ExecuteAsynchronousScript(
            args.length > 0
                ? f `#actor executes an asynchronous script with arguments: ${ args }`
                : this.toString(),
            this.script,
            args,
        );
    }

    protected async executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any> {
        const page = await BrowseTheWeb.as(actor).currentPage();
        return page.executeAsyncScript(this.script as unknown as any, ...args);   // todo: fix types
    }
}

/**
 * @package
 *
 * https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
 */
class ExecuteScriptFromUrl extends Interaction {
    constructor(private readonly sourceUrl: Answerable<string>) {
        super(f`#actor executes a script from ${ sourceUrl }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<any> {
        const page      = await BrowseTheWeb.as(actor).currentPage();
        const sourceUrl = await actor.answer(this.sourceUrl);

        return page.executeAsyncScript(
            /* c8 ignore start */
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
                    return callback(`Couldn't load script from ${ sourceUrl }`);
                });

                script.src = sourceUrl;
                script.async = true;
                document.head.append(script);
            },
            sourceUrl
            /* c8 ignore stop */
        )
        .then(errorMessage => {
            if (errorMessage) {
                throw new LogicError(errorMessage);
            }
        });
    }
}

/**
 * @package
 */
class ExecuteSynchronousScript extends ExecuteScriptWithArguments {

    withArguments(...args: Array<Answerable<any>>): Interaction {
        return new ExecuteSynchronousScript(
            args.length > 0
                ? f `#actor executes a synchronous script with arguments: ${ args }`
                : this.toString(),
            this.script,
            args,
        );
    }

    protected async executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any> {
        const page = await BrowseTheWeb.as(actor).currentPage();
        return page.executeScript(this.script as unknown as any, ...args);    // todo fix type
    }
}
