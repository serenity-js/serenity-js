import { LogicError } from '../../errors';
import { Ability } from '../Ability';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Discardable } from '../Discardable';
import { Question } from '../Question';

/**
 * @desc
 *  Enables the {@link Actor} to {@link TakeNote} of an answer to a given {@link Question}
 *  and to retrieve their {@link Note} later.
 *
 * @see {@link Note}
 * @see {@link TakeNote}
 *
 * @implements {Ability}
 * @implements {Discardable}
 */
export class TakeNotes implements Discardable, Ability {
    private static sharedNotepad = new Map<string, any>();

    /**
     * @desc
     *  Instantiates an ability to {@link TakeNotes} that uses an empty notepad.
     *
     *  This method should be used when you need the {@link Actor} to {@link TakeNote}
     *  of an answer to some {@link Question} and retrieve such {@link Note} later on in the same scenario,
     *  but you don't need the {@link Actor}s to share their notes.
     *
     * @example
     *  import { actorCalled, Log, Note, TakeNote, TakeNotes } from '@serenity-js/core'
     *  import { BrowseTheWeb, Target, Text } from '@serenity-js/protractor'
     *  import { by, protractor } from 'protractor';
     *
     *  const actor = actorCalled('Apisitt').whoCan(
     *      TakeNotes.usingAnEmptyNotepad(),
     *      CallAnApi.at('https://api.example.org'),
     *  );
     *
     *  actor.attemptsTo(
     *      Send.a(GetRequest.to('/customers')),
     *      TakeNote.of(LastResponse.status()),     // remember the LastResponse.status()
     *      // ... perform some other activities
     *      Log.the(Note.of(LastResponse.body())),  // log it later, or pass to any other interaction
     *  );
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
     * @returns {TakeNotes}
     */
    static usingAnEmptyNotepad(): TakeNotes {
        return new TakeNotes(new Map<string, any>());
    }

    /**
     * @desc
     *  Instantiates an ability to {@link TakeNotes} that uses a notepad that can be shared amongst {@link Actor}s.
     *
     *  This method should be used when you need the {@link Actor}s to {@link TakeNote}s
     *  of answers to some {@link Question}s, share those notes amongst themselves,
     *  and retrieve such shared {@link Note}s later on in the same scenario.
     *
     * @example
     *  import { actorCalled, Note, TakeNote, TakeNotes } from '@serenity-js/core'
     *  import { ManageALocalServer, StartLocalTestServer, StopLocalTestServer } from '@serenity-js/local-server'
     *  import { BrowseTheWeb } from '@serenity-js/protractor'
     *
     *  const server = http.createServer(function (request, response) {
     *      response.setHeader('Connection', 'close');
     *      response.end('Hello!');
     *  });
     *
     *  const Adam = actorCalled('Adam').whoCan(
     *      ManageALocalServer.using(server),
     *      TakeNotes.usingASharedNotepad(),
     *  );
     *
     *  const Becky = actorCalled('Becky').whoCan(
     *      TakeNotes.usingASharedNotepad(),
     *      BrowseTheWeb.using(protractor.browser),
     *  );
     *
     *  Adam.attemptsTo(
     *      StartLocalTestServer.onRandomPort(),
     *      TakeNote.of(LocalServer.url()),
     *  );
     *
     *  Becky.attemptsTo(
     *      Navigate.to(Note.of(LocalServer.url())),
     *      // perform some UI interactions
     *  );
     *
     * @returns {TakeNotes}
     */
    static usingASharedNotepad(): TakeNotes {
        return new TakeNotes(TakeNotes.sharedNotepad);
    }

    /**
     * @desc
     *  Retrieves the {@link Ability} to {@link TakeNotes}
     *  for a given {@link Actor} to be used in custom {@link Interaction}s.
     *
     * @see {@link Ability}
     * @see {@link Interaction}
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *
     * @returns {TakeNotes}
     */
    static as(actor: UsesAbilities & AnswersQuestions): TakeNotes {
        return actor.abilityTo(TakeNotes);
    }

    /**
     * @desc
     *  Instantiates the {@link Ability} to {@link TakeNotes}
     *
     * @param {Map<string, any>} notepad
     */
    constructor(private readonly notepad: Map<string, any>) {
    }

    /**
     * @desc
     *  Records the answer to a given {@link Question}
     *
     * @param {Question<Promise<Answer>> | Question<Answer>} question
     * @param {Promise<Answer> | Answer} value
     *
     * @returns {void}
     */
    record<Answer>(question: Question<Promise<Answer>> | Question<Answer>, value: Promise<Answer> | Answer): void {
        this.notepad.set(question.toString(), value);
    }

    /**
     * @desc
     *  Recalls the answer to a given {@link Question}
     *
     * @param {Question<Promise<Answer>> | Question<Answer>} question
     *
     * @returns {Promise<Answer>}
     */
    answerTo<Answer>(question: Question<Promise<Answer>> | Question<Answer>): Promise<Answer> {
        const key = question.toString();

        return ! this.notepad.has(key)
            ? Promise.reject(new LogicError(`The answer to "${ key }" has never been recorded`))
            : Promise.resolve(this.notepad.get(key));
    }

    /**
     * @desc
     *  Enables the {@link Actor} to clear the notepad when the {@link SceneFinishes}.
     *
     * @returns {Promise<void> | void}
     */
    discard(): Promise<void> | void {
        this.notepad.clear();
    }
}
