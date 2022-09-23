import { ErrorStackParser } from '../errors';
import { FileSystemLocation, Path } from '../io';
import { AnswersQuestions, PerformsActivities, UsesAbilities } from './actor';

/**
 * Serenity/JS Screenplay Pattern `Activity` represents
 * a {@apilink Task} or an {@apilink Interaction} to be performed by an {@apilink Actor}.
 *
 * ## Learn more
 * - {@apilink Actor}
 * - {@apilink PerformsActivities}
 * - [Command design pattern on Wikipedia](https://en.wikipedia.org/wiki/Command_pattern)
 *
 * @group Screenplay Pattern
 */
export abstract class Activity {

    private static errorStackParser = new ErrorStackParser();

    constructor(
        protected readonly description: string,
        private readonly location: FileSystemLocation = Activity.callerLocation(5)
    ) {
    }

    /**
     * Returns the location where this {@apilink Activity} was instantiated.
     */
    instantiationLocation(): FileSystemLocation {
        return this.location;
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

    /**
     * Generates a human-friendly description to be used when reporting this Activity.
     *
     * **Note**: When this activity is reported, token `#actor` in the description
     * will be replaced with the name of the actor performing this Activity.
     *
     * For example, `#actor clicks on a button` becomes `Wendy clicks on a button`.
     */
    toString(): string {
        return this.description;
    }

    protected static callerLocation(frameOffset: number): FileSystemLocation {
        try {
            throw new Error('Location');
        } catch (error) {
            const frames = this.errorStackParser.parse(error)
                .filter(frame => ! (
                    frame?.fileName.startsWith('node:') ||
                    frame?.fileName.includes('node_modules')
                ));

            const index = Math.min(Math.max(1, frameOffset), frames.length - 1)
            const invocationFrame = frames[index];

            return new FileSystemLocation(
                Path.from(invocationFrame.fileName),
                invocationFrame.lineNumber,
                invocationFrame.columnNumber,
            );
        }
    }
}
