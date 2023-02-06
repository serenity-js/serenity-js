import { Ability } from '../screenplay';
import { Stage } from '../stage';
import { ErrorOptions } from './ErrorOptions';
import { RuntimeError } from './model';

/**
 * An {@apilink Ability} that enables an {@apilink Actor} to create a Serenity/JS {@apilink RuntimeError}
 * from within a custom {@apilink Interaction}.
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
 * import { Interaction, LogicError, RaiseErrors } from '@serenity-js/core'
 * import isPathInside from 'is-path-inside'
 * import { unlink } from 'fs/promises'
 *
 * const RemoveFile = (pathToFile: string) =>
 *   Interaction.where(`#actor removes a file at ${ pathToFile }`, async actor => {
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
 * - {@apilink ErrorOptions}
 * - {@apilink ErrorFactory}
 * - {@apilink AssertionError}
 * - {@apilink ConfigurationError}
 * - {@apilink LogicError}
 * - {@apilink RuntimeError}
 * - {@apilink TestCompromisedError}
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
