import { TakeNotes } from '../abilities';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Question } from '../Question';

/**
 * @desc
 *  Enables the {@link Actor} to recall an answer to a given {@link Question},
 *  recorded using {@link TakeNote}.
 *
 * @example
 *  import { actorCalled, Note, TakeNote, TakeNotes } from '@serenity-js/core'
 *  import { BrowseTheWeb, Target, Text } from '@serenity-js/protractor'
 *  import { by, protractor } from 'protractor';
 *
 *  class Vouchers {
 *      static code             = Target.the('voucher code').located(by.id('voucher'));
 *      static appliedVoucher   = Target.the('voucher code').located(by.id('applied-voucher'));
 *  }
 *
 *  const actor = actorCalled('Noah').whoCan(
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
     * @desc
     *  Retrieves the previously recorded answer to a given {@link Question}
     *
     * @param {Question<Promise<A>> | Question<A>} question
     *
     * @returns {Note<A>}
     */
    static of<A>(question: Question<Promise<A>> | Question<A>): Note<A> {
        return new Note<A>(question);
    }

    /**
     * @param {Question<Promise<Answer>> | Question<Answer>} question
     */
    constructor(private readonly question: Question<Promise<Answer>> | Question<Answer>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  answer this {Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<Answer>}
     *
     * @see {@link Actor}
     * @see {@link AnswersQuestions}
     * @see {@link UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Answer> {
        return TakeNotes.as(actor).answerTo(this.question);
    }

    /**
     * Description to be used when reporting this {@link Question}.
     */
    toString() {
        return `a note of ${ this.question }`;
    }
}
