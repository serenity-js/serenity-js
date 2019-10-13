import { TakeNotes } from '../abilities';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Question } from '../Question';

/**
 * @desc
 *  Enables the {@link Actor} to recall an answer to a given {@link Question},
 *  recorded using {@link TakeNote}.
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
 * @see {@link TakeNote}
 * @see {@link TakeNotes}
 *
 * @extends {Question}
 */
export class Note<Answer> extends Question<Promise<Answer>> {

    /**
     * @param {Question<Promise<A>> | Question<A>} question
     * @returns {Note<A>}
     */
    static of<A>(question: Question<Promise<A>> | Question<A>) {
        return new Note<A>(question);
    }

    /**
     * @param {Question<Promise<Answer>> | Question<Answer>} question
     */
    constructor(private readonly question: Question<Promise<Answer>> | Question<Answer>) {
        super();
    }

    /**
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<Answer>}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Answer> {
        return TakeNotes.as(actor).answerTo(this.question);
    }
}
