import { AnswersQuestions, PerformsActivities, UsesAbilities } from './actor';

/**
 * Serenity/JS Screenplay Pattern `Activity` represents
 * a {@link Task} or an {@link Interaction} to be performed by an {@link Actor}.
 *
 * ## Learn more
 * - {@link Actor}
 * - {@link PerformsActivities}
 * - [Command design pattern on Wikipedia](https://en.wikipedia.org/wiki/Command_pattern)
 *
 * @group Screenplay Pattern
 */
export interface Activity {

    /**
     * Instructs the provided {@link Actor} to perform this {@link Activity}.
     *
     * @param actor
     *
     * #### Learn more
     * - {@link Actor}
     * - {@link PerformsActivities}
     * - {@link UsesAbilities}
     * - {@link AnswersQuestions}
     */
    performAs(actor: PerformsActivities | UsesAbilities | AnswersQuestions): Promise<any>;

    /**
     * Generates a human-friendly description to be used when reporting this Activity.
     *
     * **Note**: When this activity is reported, token `#actor` in the description
     * will be replaced with the name of the actor performing this Activity.
     *
     * For example, `#actor clicks on a button` becomes `Wendy clicks on a button`.
     */
    toString(): string;
}
