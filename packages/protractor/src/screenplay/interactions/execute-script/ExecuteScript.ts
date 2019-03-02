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

    static async(script: string | Function): ExecuteScriptWithArguments {                // tslint:disable-line:ban-types
        return new ExecuteAsynchronousScript(script);
    }

    static sync(script: string | Function): ExecuteScriptWithArguments {                  // tslint:disable-line:ban-types
        return new ExecuteSynchronousScript(script);
    }
}

// todo: add questions around scripts that return values
