import { ErrorStackParser } from '../errors/index.js';
import { FileSystemLocation, Path } from '../io/index.js';
import type { UsesAbilities } from './abilities/index.js';
import type { PerformsActivities } from './activities/index.js';
import type { Answerable } from './Answerable.js';
import type { AnswersQuestions } from './questions/AnswersQuestions.js';
import { Describable } from './questions/Describable.js';

/**
 * Pattern that matches `node_modules` paths (using either `/` or `\` as separator)
 * but excludes `@serenity-js/` packages.
 *
 * Uses both separators because ESM stack frames produce `file:///` URLs with forward slashes
 * even on Windows, while CJS frames use the platform separator.
 *
 * @package
 */
export const nonSerenityNodeModulePattern = /node_modules[/\\](?!@serenity-js[/\\])/;

/**
 * Converts a `file:///` URL to a filesystem path, handling both
 * Windows drive letters (`file:///C:/path`) and Unix absolute paths (`file:///home/user`).
 *
 * Returns the input unchanged if it is not a `file:///` URL.
 *
 * @package
 */
export function fileUrlToPath(fileName: string): string {
    return fileName
        ?.replace(/^file:\/\/\/([a-zA-Z]:)/, '$1')
        .replace(/^file:\/\//, '');
}

/**
 * Key of the static brand that identifies `Activity`, `Interaction` and `Task` classes
 * across copies of `@serenity-js/core` loaded from the CJS and ESM builds.
 *
 * `Symbol.for` returns the same symbol across module copies, so the key must match
 * the one declared in `Interaction.ts` and `Task.ts`.
 */
const activityType: unique symbol = Symbol.for('@serenity-js/core/ActivityType');

/**
 * **Activities** represents [tasks](https://serenity-js.org/api/core/class/Task/) and [interactions](https://serenity-js.org/api/core/class/Interaction/) to be performed by an [actor](https://serenity-js.org/api/core/class/Actor/).
 *
 * Learn more about:
 * - [Performing activities at multiple levels](https://serenity-js.org/handbook/design/screenplay-pattern#performing-activities-at-multiple-levels)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * - [`PerformsActivities`](https://serenity-js.org/api/core/interface/PerformsActivities/)
 * - [Command design pattern on Wikipedia](https://en.wikipedia.org/wiki/Command_pattern)
 *
 * @group Screenplay Pattern
 */
export abstract class Activity extends Describable {

    private static readonly [activityType] = '@serenity-js/core/Activity';

    /**
     * Custom `instanceof` check that recognises activities created by another copy of `@serenity-js/core`.
     *
     * This addresses the dual-package hazard, where the same class loaded from both the CJS and ESM builds
     * results in two distinct constructor functions. For example, `Navigate` loaded via `require('@serenity-js/web')`
     * extends the CJS `Interaction`, while the actor performing it might have been created by the ESM build.
     *
     * Checks against `Activity`, `Interaction` and `Task` match any instance whose prototype chain contains
     * a class with the same brand. Checks against any other subclasses retain the native `instanceof` semantics.
     *
     * See https://github.com/serenity-js/serenity-js/issues/3535
     *
     * @param instance
     */
    static [Symbol.hasInstance](instance: unknown): boolean {
        if (Function.prototype[Symbol.hasInstance].call(this, instance)) {
            return true;
        }

        if (! Object.hasOwn(this, activityType) || instance === null || typeof instance !== 'object') {
            return false;
        }

        const expectedType = this[activityType];

        let prototype = Object.getPrototypeOf(instance);
        while (prototype !== null) {
            const constructor = prototype.constructor;

            if (typeof constructor === 'function' && Object.hasOwn(constructor, activityType) && constructor[activityType] === expectedType) {
                return true;
            }

            prototype = Object.getPrototypeOf(prototype);
        }

        return false;
    }

    private static errorStackParser = new ErrorStackParser();
    readonly #location: FileSystemLocation;

    constructor(
        description: Answerable<string>,
        location: FileSystemLocation = Activity.callerLocation(5)
    ) {
        super(description);
        this.#location = location;
    }

    /**
     * Returns the location where this [`Activity`](https://serenity-js.org/api/core/class/Activity/) was instantiated.
     */
    instantiationLocation(): FileSystemLocation {
        return this.#location;
    }

    /**
     * Instructs the provided [`Actor`](https://serenity-js.org/api/core/class/Actor/) to perform this [`Activity`](https://serenity-js.org/api/core/class/Activity/).
     *
     * @param actor
     *
     * #### Learn more
     * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * - [`PerformsActivities`](https://serenity-js.org/api/core/interface/PerformsActivities/)
     * - [`UsesAbilities`](https://serenity-js.org/api/core/interface/UsesAbilities/)
     * - [`AnswersQuestions`](https://serenity-js.org/api/core/interface/AnswersQuestions/)
     */
    abstract performAs(actor: PerformsActivities | UsesAbilities | AnswersQuestions): Promise<any>;

    protected static callerLocation(frameOffset: number): FileSystemLocation {

        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 30;
        const error = new Error('Caller location marker');
        Error.stackTraceLimit = originalStackTraceLimit;

        const frames = this.errorStackParser.parse(error);
        const userLandFrames = frames.filter(frame => ! (
            frame?.fileName.startsWith('node:') ||          // node 16 and 18
            frame?.fileName.startsWith('internal') ||       // node 14
            nonSerenityNodeModulePattern.test(frame?.fileName)    // ignore node_modules, except for @serenity-js/*
        ));

        const index = Math.min(Math.max(1, frameOffset), userLandFrames.length - 1);
        // use the desired user-land frame, or the last one from the stack trace for internal invocations
        const invocationFrame = userLandFrames[index] || frames.at(-1);

        return new FileSystemLocation(
            Path.from(fileUrlToPath(invocationFrame.fileName)),
            invocationFrame.lineNumber,
            invocationFrame.columnNumber,
        );
    }
}
