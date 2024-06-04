import path from 'path';

import { ErrorStackParser } from '../errors';
import { FileSystemLocation, Path } from '../io';
import type { UsesAbilities } from './abilities/UsesAbilities';
import type { PerformsActivities } from './activities/PerformsActivities';
import type { Answerable } from './Answerable';
import { Describable } from './Describable';
import type { AnswersQuestions } from './questions/AnswersQuestions';

/**
 * **Activities** represents {@apilink Task|tasks} and {@apilink Interaction|interactions} to be performed by an {@apilink Actor|actor}.
 *
 * Learn more about:
 * - [Performing activities at multiple levels](/handbook/design/screenplay-pattern#performing-activities-at-multiple-levels)
 * - {@apilink Actor}
 * - {@apilink PerformsActivities}
 * - [Command design pattern on Wikipedia](https://en.wikipedia.org/wiki/Command_pattern)
 *
 * @group Screenplay Pattern
 */
export abstract class Activity extends Describable {

    private static errorStackParser = new ErrorStackParser();
    // readonly #description: Answerable<string>;
    readonly #location: FileSystemLocation;

    constructor(
        description: Answerable<string>,
        location: FileSystemLocation = Activity.callerLocation(5)
    ) {
        super(description)
        // this.#description = description;
        this.#location = location;
    }

    /**
     * Returns the location where this {@apilink Activity} was instantiated.
     */
    instantiationLocation(): FileSystemLocation {
        return this.#location;
    }

    /**
     * Instructs the provided {@apilink Actor} to perform this {@apilink Activity}.
     *
     * @param actor
     *
     * #### Learn more
     * - {@apilink Actor}
     * - {@apilink PerformsActivities}
     * - {@apilink UsesAbilities}
     * - {@apilink AnswersQuestions}
     */
    abstract performAs(actor: PerformsActivities | UsesAbilities | AnswersQuestions): Promise<any>;

    // todo: remove
    // async describedBy(actor: AnswersQuestions & DescribesActivities & UsesAbilities): Promise<Description> {
    //     const description = await actor.answer(this.#description);
    //     // todo: Do I need the Description class at all?
    //     return new Description(description);
    // }

    /**
     * Generates a human-friendly description to be used when reporting this Activity.
     *
     * **Note**: When this activity is reported, token `#actor` in the description
     * will be replaced with the name of the actor performing this Activity.
     *
     * For example, `#actor clicks on a button` becomes `Wendy clicks on a button`.
     */
    // todo: remove
    // toString(): string {
    //     return String(this.#description);
    // }

    protected static callerLocation(frameOffset: number): FileSystemLocation {

        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 30;
        const error = new Error('Caller location marker');
        Error.stackTraceLimit = originalStackTraceLimit;

        const nonSerenityNodeModulePattern = new RegExp(`node_modules` + `\\` + path.sep + `(?!@serenity-js`+ `\\` + path.sep +`)`);

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
            Path.from(invocationFrame.fileName?.replace(/^file:/, '')),
            invocationFrame.lineNumber,
            invocationFrame.columnNumber,
        );
    }
}
