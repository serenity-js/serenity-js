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
export interface Activity {

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
