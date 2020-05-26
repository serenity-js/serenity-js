import { formatted } from '../../io';
import { TakeNotes } from '../abilities';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Interaction } from '../Interaction';
import { Question } from '../Question';

/**
 * @desc
 *  Enables the {@link Actor} to remember an answer to a given {@link Question},
 *  and recall it later.
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
 * @see {@link Note}
 * @see {@link TakeNotes}
 *
 * @extends {Interaction}
 */
export class TakeNote<Answer> extends Interaction {

    /**
     * @param {Question<Promise<A>> | Question<A>} question
     */
    static of<A>(question: Question<Promise<A>> | Question<A>) {
        return new TakeNote<A>(question);
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
     *  perform this {@link Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.question)
            .then(answer => TakeNotes.as(actor).record(this.question, answer));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString() {
        return formatted `#actor takes note ${ this.question }`;
    }
}
