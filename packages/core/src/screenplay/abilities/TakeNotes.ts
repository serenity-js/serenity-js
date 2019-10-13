import { LogicError } from '../../errors';
import { Ability } from '../Ability';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Question } from '../Question';

/**
 * @desc
 *  Enables the {@link Actor} to remember an answer to a given {@link Question},
 *  and recall it later.
 *
 * @example
 *  import { Note, TakeNote, TakeNotes } from '@serenity-js/core'
 *  import { BrowseTheWeb, Target, Text } from '@serenity-js/protractor'
 *  import { by, protractor } from 'protractor';
 *
 *  class Vouchers {
 *      static code             = Target.the('voucher code').located(by.id('voucher'));
 *      static appliedVoucher   = Target.the('voucher code').located(by.id('applied-voucher'));
 *  }
 *
 *  const actor = Actor.named('Noah').whoCan(
 *      TakeNotes.usingAnEmptyNotepad(),
 *      BrowseTheWeb.using(protractor.browser),
 *  );
 *
 *  actor.attemptsTo(
 *      TakeNote.of(Text.of(Vouchers.code)),
 *      // ... add the product to a basket, go to checkout, etc.
 *      Ensure.that(Text.of(Vouchers.appliedVoucher), equals(Note.of(Text.of(Vouchers.code)))),
 *  );
 *
 * @see {@link Note}
 * @see {@link TakeNote}
 *
 * @implements {Ability}
 */
export class TakeNotes implements Ability {
    /**
     * @returns {TakeNotes}
     */
    static usingAnEmptyNotepad(): TakeNotes {
        return new TakeNotes({});
    }

    /**
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {TakeNotes}
     */
    static as(actor: UsesAbilities & AnswersQuestions): TakeNotes {
        return actor.abilityTo(TakeNotes);
    }

    /**
     * @param {object} notepad
     */
    constructor(private readonly notepad: { [key: string]: any }) {
    }

    /**
     * Records the answer to a given {@link Question}
     *
     * @param {Question<Promise<Answer>> | Question<Answer>} question
     * @param {Promise<Answer> | Answer} value
     */
    record<Answer>(question: Question<Promise<Answer>> | Question<Answer>, value: Promise<Answer> | Answer): void {
        this.notepad[question.toString()] = value;
    }

    /**
     * Recalls the answer to a given {@link Question}
     *
     * @param {Question<Promise<Answer>> | Question<Answer>} question
     */
    answerTo<Answer>(question: Question<Promise<Answer>> | Question<Answer>): Promise<Answer> {
        const key = question.toString();

        return ! ~Object.keys(this.notepad).indexOf(key)
            ? Promise.reject(new LogicError(`The answer to "${ key }" has never been recorded`))
            : Promise.resolve(this.notepad[key]);
    }
}
