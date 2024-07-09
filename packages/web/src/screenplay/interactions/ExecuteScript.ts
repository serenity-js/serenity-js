import type { Answerable, AnswersQuestions, CollectsArtifacts, UsesAbilities } from '@serenity-js/core';
import { Interaction, LogicError, the } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';
import { Name, TextData } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../abilities';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to inject a script into the browser and execute it in the context of the current browser tab.
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`LastScriptExecution.result`](https://serenity-js.org/api/web/class/LastScriptExecution/#result)
 *
 * @group Activities
 */
export class ExecuteScript {

    /**
     * Instantiates a version of this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/)
     * configured to load a script from `sourceUrl`.
     *
     * @param sourceUrl
     *  The URL to load the script from
     */
    static from(sourceUrl: Answerable<string>): Interaction {
        return new ExecuteScriptFromUrl(sourceUrl);
    }

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to execute an asynchronous script within the context of the current browser tab.
     *
     * The script fragment will be executed as the body of an anonymous function.
     * If the script is provided as a function object, that function will be converted to a string for injection
     * into the target window.
     *
     * Any arguments provided in addition to the script will be included as script arguments and may be referenced
     * using the `arguments` object. Arguments may be a `boolean`, `number`, `string`
     * or [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     * Arrays and objects may also be used as script arguments as long as each item adheres
     * to the types previously mentioned.
     *
     * Unlike executing synchronous JavaScript with [`ExecuteScript.sync`](https://serenity-js.org/api/web/class/ExecuteScript/#sync),
     * scripts executed with this function must explicitly signal they are finished by invoking the provided callback.
     *
     * This callback will always be injected into the executed function as the last argument,
     * and thus may be referenced with `arguments[arguments.length - 1]`.
     *
     * If the script invokes the `callback` with a return value, this will be made available
     * via the [`LastScriptExecution.result`](https://serenity-js.org/api/web/class/LastScriptExecution/#result).
     *
     * **Please note** that in order to signal an error in the `script` you need to throw an [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
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
     * #### Executing async script as function
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript } from '@serenity-js/web'
     *
     * const MyPage = {
     *   header: () =>
     *     PageElement.located(By.css('h1')).describedAs('header'),
     * }
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(function getText(header, callback) {
     *     callback(header.innerText)
     *   }).withArguments(MyPage.header())
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
     * #### Passing PageElement arguments to an async script
     *
     * Serenity/JS automatically converts [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) objects passed as arguments to the script
     * into their corresponding DOM elements.
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript, PageElement } from '@serenity-js/web'
     *
     * const MyPage = {
     *   header: () =>
     *     PageElement.located(By.css('h1')).describedAs('header'),
     * }
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(`
     *     var header = arguments[0]
     *     var callback = arguments[arguments.length - 1]
     *
     *     callback(header.innerText)
     *   `).withArguments(MyPage.header())
     * )
     * ```
     *
     * #### Using nested data structures containing PageElement objects
     *
     * Serenity/JS automatically converts any [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) objects
     * contained in nested data structures passed to the script
     * into their corresponding DOM elements.
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript, PageElement } from '@serenity-js/web'
     *
     * const MyPage = {
     *   header: () =>
     *     PageElement.located(By.css('h1')).describedAs('header'),
     *
     *   article: () =>
     *     PageElement.located(By.css('article')).describedAs('article'),
     * }
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(`
     *     var { include, exclude }  = arguments[0]
     *     var callback = arguments[arguments.length - 1]
     *
     *     callback(include[0].innerText)
     *   `).withArguments({
     *     include: [ MyPage.article() ],
     *     exclude: [ MyPage.header() ],
     *   })
     * )
     * ```
     *
     * #### Learn more
     * - [`LastScriptExecution.result`](https://serenity-js.org/api/web/class/LastScriptExecution/#result)
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
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to execute a synchronous script within the context of the current browser tab.
     *
     * If the script returns a value, it will be made available via [`LastScriptExecution.result`](https://serenity-js.org/api/web/class/LastScriptExecution/#result).
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
     * #### Executing a sync script as function and retrieving the result
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { By, Enter, ExecuteScript, LastScriptExecution, PageElement } from '@serenity-js/web'
     *
     * const Checkout = {
     *   someOfferField: () =>
     *     PageElement.located(By.id('offer-code'))
     *       .describedAs('offer code')
     *
     *   applyOfferCodeField = () =>
     *     PageElement.located(By.id('apply-offer-code'))
     *       .describedAs('apply offer field')
     * }
     *
     * await actorCalled('Joseph')
     *   .attemptsTo(
     *     // inject JavaScript to read some property of an element
     *     ExecuteScript.sync(function getValue(element) {
     *         return element.value;
     *     }).withArguments(Checkout.someOfferField()),
     *
     *     // use LastScriptExecution.result() to read the value
     *     // returned from the injected script
     *     // and pass it to another interaction
     *     Enter.theValue(LastScriptExecution.result<string>()).into(Checkout.applyOfferCodeField()),
     *   )
     * ```
     *
     * #### Passing PageElement arguments to a sync script
     *
     * Serenity/JS automatically converts [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) objects passed as arguments to the script
     * into their corresponding DOM elements.
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript, PageElement } from '@serenity-js/web'
     *
     * const MyPage = {
     *   header: () =>
     *     PageElement.located(By.css('h1')).describedAs('header'),
     * }
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.sync(function getInnerHtml(element) {
     *     return element.innerHTML;
     *   }).withArguments(MyPage.header())
     * )
     * ```
     *
     * #### Using nested data structures containing PageElement objects
     *
     * Serenity/JS automatically converts any [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) objects
     * contained in nested data structures passed to the script
     * into their corresponding DOM elements.
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { ExecuteScript, PageElement } from '@serenity-js/web'
     *
     * const MyPage = {
     *   header: () =>
     *     PageElement.located(By.css('h1')).describedAs('header'),
     *
     *   article: () =>
     *     PageElement.located(By.css('article')).describedAs('article'),
     * }
     *
     * await actorCalled('Esti').attemptsTo(
     *   ExecuteScript.async(function getInnerHtml(scope) {
     *     return scope.include[0].innerHTML;
     *   `).withArguments({
     *     include: [ MyPage.article() ],
     *     exclude: [ MyPage.header() ],
     *   })
     * )
     * ```
     *
     * #### Learn more
     * - [`LastScriptExecution.result`](https://serenity-js.org/api/web/class/LastScriptExecution/#result)
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
 * -  [`ExecuteScript`](https://serenity-js.org/api/web/class/ExecuteScript/)
 *
 * @group Activities
 */
export abstract class ExecuteScriptWithArguments extends Interaction {

    constructor(
        description: Answerable<string>,
        protected readonly script: string | Function,           // eslint-disable-line @typescript-eslint/ban-types
        protected readonly args: Array<Answerable<any>> = [],
    ) {
        super(description, Interaction.callerLocation(5));
    }

    /**
     * Instantiates this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/)
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
                ? the `#actor executes an asynchronous script with arguments: ${ args }`
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
        super(the`#actor executes a script from ${ sourceUrl }`);
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
                ? the `#actor executes a synchronous script with arguments: ${ args }`
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
