import { Ability } from '../screenplay/abilities/Ability';
import type { Stage } from '../stage/Stage';
import type { ErrorOptions } from './ErrorOptions';
import type { RuntimeError } from './model/RuntimeError';

/**
 * An [`Ability`](https://serenity-js.org/api/core/class/Ability/) that enables an [`Actor`](https://serenity-js.org/api/core/class/Actor/) to create a Serenity/JS [`RuntimeError`](https://serenity-js.org/api/core/class/RuntimeError/)
 * from within a custom [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
 *
 * The stack trace of an error created this way includes the filesystem location pointing to where the interaction was invoked,
 * which makes debugging any failures easier.
 *
 * :::info Pro tip
 * The ability to `RaiseErrors` is given to all Serenity/JS actors by default, so you don't need to configure it explicitly.
 * :::
 *
 * ## Raising an error
 *
 * ```typescript
 * import { Interaction, LogicError, RaiseErrors, the } from '@serenity-js/core'
 * import isPathInside from 'is-path-inside'
 * import { unlink } from 'fs/promises'
 *
 * const RemoveFile = (pathToFile: string) =>
 *   Interaction.where(the`#actor removes a file at ${ pathToFile }`, async actor => {
 *
 *     if (! isPathInside(pathToFile, process.cwd())) {
 *
 *       throw RaiseErrors.as(actor).create(LogicError, {
 *         message: `Removing files outside the current working directory is not allowed`
 *         diff: {
 *           expected: process.cwd(),
 *           actual: pathToFile,
 *         }
 *       })
 *     }
 *
 *     await unlink(pathToFile);
 *   })
 * ```
 *
 * ## Learn more
 * - [`ErrorOptions`](https://serenity-js.org/api/core/interface/ErrorOptions/)
 * - [`ErrorFactory`](https://serenity-js.org/api/core/class/ErrorFactory/)
 * - [`AssertionError`](https://serenity-js.org/api/core/class/AssertionError/)
 * - [`ConfigurationError`](https://serenity-js.org/api/core/class/ConfigurationError/)
 * - [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
 * - [`RuntimeError`](https://serenity-js.org/api/core/class/RuntimeError/)
 * - [`TestCompromisedError`](https://serenity-js.org/api/core/class/TestCompromisedError/)
 *
 * @group Errors
 */
export class RaiseErrors extends Ability {
    constructor(private readonly stage: Stage) {
        super();
    }

    create<RE extends RuntimeError>(errorType: new (...args: any[]) => RE, options: ErrorOptions): RE {
        return this.stage.createError(errorType, options);
    }
}
