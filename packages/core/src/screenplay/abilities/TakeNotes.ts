import { LogicError } from '../../errors';
import { Ability } from '../Ability';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Question } from '../Question';
import { Discardable } from './Discardable';

/**
 * @desc
 *  Enables the {@link Actor} to {@link TakeNote} of an answer to a given {@link Question}
 *  and to retrieve their {@link Note} later.
 *
 * @see {@link Note}
 * @see {@link TakeNote}
 *
 * @abstract
 * @implements {Ability}
 */
export abstract class TakeNotes implements Ability {

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
     * @returns {TakeNotes & Discardable}
     */
    static usingAnEmptyNotepad(): TakeNotes & Discardable {
        return new TakeNotesUsingAnEmptyNotepad();
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
        return new TakeNotesUsingASharedNotepad();
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
    protected constructor(protected readonly notepad: Map<string, any>) {
    }

    /**
     * @desc
     *  Records the answer to a given {@link Question}
     *
     * @param {Question<Promise<Answer>> | Question<Answer> | string} subject
     *  Question or name to record the Answer as
     *
     * @param {Promise<Answer> | Answer} value
     *  The Answer to record
     *
     * @returns {void}
     */
    record<Answer>(subject: Question<Promise<Answer>> | Question<Answer> | string, value: Promise<Answer> | Answer): void {
        this.notepad.set(subject.toString(), value);
    }

    /**
     * @desc
     *  Recalls the answer to a given {@link Question}
     *
     * @param {Question<Promise<Answer>> | Question<Answer> | string} subject
     *  Question or name the Answer was recorded as
     *
     * @returns {Promise<Answer>}
     */
    answerTo<Answer>(subject: Question<Promise<Answer>> | Question<Answer> | string): Promise<Answer> {
        const key = subject.toString();

        return ! this.notepad.has(key)
            ? Promise.reject(new LogicError(`The answer to "${ key }" has never been recorded`))
            : Promise.resolve(this.notepad.get(key));
    }
}

/**
 * @package
 */
class TakeNotesUsingAnEmptyNotepad extends TakeNotes implements Discardable {

    /**
     * @desc
     *  Instantiates the {@link Ability} to {@link TakeNotes}
     *
     * @param {Map<string, any>} notepad
     */
    constructor() {
        super(new Map<string, any>());
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

/**
 * @package
 */
class TakeNotesUsingASharedNotepad extends TakeNotes {
    private static sharedNotepad = new Map<string, any>();

    /**
     * @desc
     *  Instantiates the {@link Ability} to {@link TakeNotes}
     *
     * @param {Map<string, any>} notepad
     */
    constructor() {
        super(TakeNotesUsingASharedNotepad.sharedNotepad);
    }
}
