import { Ability } from '../Ability';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Notepad } from './Notepad';

/**
 * @desc
 *  An {@link Ability} that enables an {@link Actor} to remember information
 *  to be recalled during a test scenario.
 *
 *  Under the hood, {@link TakeNotes} uses a {@link Notepad}, which state
 *  can be populated both during initialisation or while the test scenario is executed.
 *  Populating the notepad when it's initialised can be useful to associate authentication credentials
 *  or personal details with a given actor, while dynamic recording of notes during a test scenario
 *  can be useful when the data to be recorded is not known upfront - for example when we want
 *  the actor to remember a JWT stored in the browser and then use it when sending API requests.
 *
 *  **Please note** that {@link TakeNotes}, {@link Notepad} and {@link Note} can be typed
 *  using {@link TypeScript~generics} to help you avoid typos when specifying note names.
 *
 *  See {@link Note} and {@link Notepad} for more usage examples.
 *
 * @example <caption>Remembering and retrieving a value</caption>
 *
 *  import { actorCalled, Log, Note, TakeNotes } from '@serenity-js/core';
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.usingAnEmptyNotepad())
 *      .attemptsTo(
 *          Note.record('my_note', 'some value'),
 *          Log.the(Note.of('my_note')),
 *      );
 *
 * @example <caption>Using generics</caption>
 *  import { actorCalled, Log, Note, TakeNotes } from '@serenity-js/core';
 *
 *  interface PersonalDetails {
 *      first_name?: string;
 *      last_name?: string;
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.usingAnEmptyNotepad<PersonalDetails>())
 *      .attemptsTo(
 *          Note.record<PersonalDetails>('first_name', 'Leonard'),
 *          Log.the(Note.of<PersonalDetails>('first_name')),       // emits 'Leonard'
 *      );
 *
 * @example <caption>Populating the notepad with initial state</caption>
 *  import { actorCalled, Log, Note, Notepad, TakeNotes } from '@serenity-js/core';
 *
 *  interface PersonalDetails {
 *      first_name?: string;
 *      last_name?: string;
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(
 *          TakeNotes.using(Notepad.with<PersonalDetails>({
 *              first_name: 'Leonard',
 *          })
 *      )
 *      .attemptsTo(
 *          Note.record<PersonalDetails>('last_name', 'Shelby'),
 *          Log.the(Note.of<PersonalDetails>('first_name')),      // emits 'Leonard'
 *          Log.the(Note.of<PersonalDetails>('last_name')),       // emits 'Shelby'
 *      );
 *
 * @example <caption>Recording a dynamic note</caption>
 *  import { actorCalled, Log, Note, Notepad, TakeNotes } from '@serenity-js/core';
 *  import { By, Text, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  interface OnlineShoppingNotes {
 *      promo_code?: string;
 *  }
 *
 *  const promoCodeBanner = () =>
 *      PageElement.located(By.css('[data-testid="promo-code"]'))
 *          .describedAs('promo code');
 *
 * const promoCodeInput = () =>
 *      PageElement.located(By.css('[data-testid="promo-code-input"]'))
 *          .describedAs('promo code field');
 *
 *  actorCalled('Leonard')
 *      .whoCan(
 *          BrowseTheWebWithWebdriverIO.using(browser),
 *          TakeNotes.using(Notepad.empty<OnlineShoppingNotes>())
 *      )
 *      .attemptsTo(
 *          Note.record<OnlineShoppingNotes>('promo_code', Text.of(promoCode()),
 *          // ...
 *          Enter.theValue(Note.of<OnlineShoppingNotes>('promo_code'))
 *              .into(promoCodeInput())
 *      );
 *
 * @example <caption>Clearing a notepad before each test scenario (Mocha)</caption>
 * import 'mocha';
 *
 * beforeEach(() =>
 *   actorCalled('Leonard')
 *      .attemptsTo(
 *          Notepad.clear(),
 *      ));
 *
 * @example <caption>Clearing a notepad before each test scenario (Cucumber)</caption>
 * import { Before } from '@cucumber/cucumber';
 *
 * Before(() =>
 *   actorCalled('Leonard')
 *      .attemptsTo(
 *          Notepad.clear(),
 *      ));
 *
 * @example <caption>Importing notes dynamically</caption>
 *  // given an example API:
 *  //   GET /generate-test-user
 *  // which returns:
 *  //   { "first_name": "Leonard", "last_name": "Shelby" }
 *
 *  import { actorCalled, Log, Note, Notepad, TakeNotes } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, Send } from '@serenity-js/rest';
 *
 *  interface PersonalDetails {
 *      first_name?: string;
 *      last_name?: string;
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(
 *          CallAnApi.at('https://api.example.org/'),
 *          TakeNotes.using(Notepad.empty())
 *      )
 *      .attemptsTo(
 *          Send.a(GetRequest.to('/generate-test-user')),
 *          Notepad.import(LastResponse.body<PersonalDetails>()),
 *          Log.the(Note.of<PersonalDetails>('first_name')),      // emits 'Leonard'
 *          Log.the(Note.of<PersonalDetails>('last_name')),       // emits 'Shelby'
 *      );
 *
 * @example <caption>Using the QuestionAdapter</caption>
 *  import { actorCalled, Log, Note, Notepad, TakeNotes } from '@serenity-js/core';
 *
 *  interface AuthCredentials {
 *      username?: string;
 *      password?: string;
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(
 *          TakeNotes.using(
 *              Notepad.with<AuthCredentials>({
 *                  username: 'leonard@example.org',
 *                  password: 'SuperSecretP@ssword!',
 *              })
 *          )
 *      )
 *      .attemptsTo(
 *          Log.the(
 *              Note.of<AuthCredentials>('password')    // returns QuestionAdapter<string>
 *                .charAt(0).toLocaleLowerCase(),
 *          ), // emits 's'
 *      );
 *
 * @see {@link Note}
 * @see {@link Notepad}
 *
 * @implements {Ability}
 */
export class TakeNotes<Notes extends Record<string, any>> implements Ability {

    /**
     * @desc
     *  Initialises an {@link Ability} to {@link TakeNotes} with {@link Notepad.empty}
     *
     * @returns {TakeNotes<N>}
     */
    static usingAnEmptyNotepad<N extends Record<string, any>>(): TakeNotes<N> {
        return TakeNotes.using<N>(Notepad.empty<N>());
    }

    /**
     * @desc
     *  Initialises an {@link Ability} to {@link TakeNotes} using
     *  a {@link Notepad.with} some initial state.
     *
     * @param {Notepad<N>} notepad
     *
     * @returns {TakeNotes<N>}
     */
    static using<N extends Record<string, any>>(notepad: Notepad<N>): TakeNotes<N> {
        return new TakeNotes<N>(notepad);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link TakeNotes}
     *  from within {@link Interaction} and {@link Question} classes.
     *
     * @param {UsesAbilities} actor
     * @returns {TakeNotes<N>}
     */
    static as<N extends Record<string, any>>(actor: UsesAbilities & AnswersQuestions): TakeNotes<N> {
        return actor.abilityTo(TakeNotes) as TakeNotes<N>;
    }

    /**
     * @param {Notepad<Notes>} notepad
     * @protected
     */
    protected constructor(private readonly notepad: Notepad<Notes>) {
    }

    /**
     * @desc
     *  Import all the notes from the provided object and merge them with the existing notes.
     *  Overwrites any existing notes with the same subject.
     *
     * @param {Partial<Notes>} notes
     * @returns {void}
     */
    public import(notes: Partial<Notes>): void {
        return this.notepad.import(notes);
    }

    /**
     * @desc
     *  Return the value of a note with a given `subject`.
     *
     * @param {Subject extends keyof Notes} subject
     *  The subject (name) that uniquely identifies a given note
     *
     * @returns {Notes[Subject]}
     */
    public read<Subject extends keyof Notes>(subject: Subject): Notes[Subject] {
        return this.notepad.read(subject);
    }

    /**
     * @desc
     *  Record a note under a given `subject`.
     *
     * @param {Subject extends keyof Notes} subject
     *  The subject (name) to uniquely identify a given note
     *
     * @param {Notes[Subject]} value
     *  The value to record
     */
    public write<Subject extends keyof Notes>(subject: Subject, value: Notes[Subject]): void {
        this.notepad.write(subject, value);
    }

    /**
     * @desc
     *  Removes a note identified by the given subject (name).
     *
     * @param {Subject extends keyof Notes} subject
     *  The subject (name) that uniquely identifies a given note
     *
     * @returns {boolean}
     *  Returns `true` if the note existed, `false` otherwise.
     */
    public remove<Subject extends keyof Notes>(subject: Subject): boolean {
        return this.notepad.remove(subject);
    }

    /**
     * @desc
     *  Removes all the notes from the {@link Notepad} associated with a given {@link Actor}.
     *
     * @returns {void}
     */
    public clearNotepad(): void {
        return this.notepad.clear();
    }
}
