import { AnswersQuestions, PerformsActivities, UsesAbilities } from './actor';

/**
 * @desc
 *  A command object representing an activity that an {@link Actor} can perform.
 *
 * @see {@link Actor}
 * @see https://en.wikipedia.org/wiki/Command_pattern
 */
export interface Activity {

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this Activity.
     *
     * @param {PerformsActivities | UsesAbilities | AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link PerformsActivities}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     */
    performAs(actor: PerformsActivities | UsesAbilities | AnswersQuestions): PromiseLike<any>;

    /**
     * @desc
     *  Generates a description to be used when reporting this Activity.
     *
     * @returns {string}
     */
    toString(): string;
}
