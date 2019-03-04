import { Interaction } from '@serenity-js/core';

import { ExecuteAsynchronousScript } from './ExecuteAsynchronousScript';
import { ExecuteScriptFromUrl } from './ExecuteScriptFromUrl';
import { ExecuteScriptWithArguments } from './ExecuteScriptWithArguments';
import { ExecuteSynchronousScript } from './ExecuteSynchronousScript';

/**
 * @public
 */
export class ExecuteScript {
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
     *  or `Target` (`Question<ElementFinder>`).
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
     *  via the {@Link LastScriptExecution.result}
     *
     *  **Please note** that in order to signal an error in the `script` you need to throw an {@link Error}
     *  instead of passing it to the callback function.
     *
     * @example <caption>Executing an async script</caption>
     *  actor.attemptsTo(ExecuteScript.async(
     *    var callback = arguments[arguments.length - 1];
     *
     *    // do stuff
     *
     *    callback(result)
     *  ));
     *
     * @example <caption>Passing arguments to an async script</caption>
     *  actor.attemptsTo(ExecuteScript.async(
     *    var name = arguments[0];
     *    var age = arguments[1];
     *    var callback = arguments[arguments.length - 1];
     *
     *    // do stuff
     *
     *    callback(result)
     *  ).withArguments('Bob', 24));
     *
     * @example <caption>Passing Target arguments to an async script</caption>
     * actor.attemptsTo(ExecuteScript.async(
     *    var header = arguments[0];    // Target gets converted to a WebElement
     *    var callback = arguments[arguments.length - 1];
     *
     *    callback(header.innerText)
     *  ).withArguments(Target.the('header').located(by.css('h1'))));
     *
     * @param {string | Function} script
     * @returns {ExecuteScriptWithArguments}
     */
    static async(script: string | Function): ExecuteScriptWithArguments {                // tslint:disable-line:ban-types
        return new ExecuteAsynchronousScript(script);
    }

    static sync(script: string | Function): ExecuteScriptWithArguments {                  // tslint:disable-line:ban-types
        return new ExecuteSynchronousScript(script);
    }
}
