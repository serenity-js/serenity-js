import { Ability } from '../Ability';
import { UsesAbilities } from '../actor';
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
 *  **Pro tip:** {@link TakeNotes}, {@link Notepad} and {@link notes} can be typed
 *  using {@link TypeScript~generics} to help you avoid typos when specifying note names.
 *
 *  See {@link notes} and {@link Notepad} for more usage examples.
 *
 * @example <caption>Remembering and retrieving a value</caption>
 *
 *  import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.usingAnEmptyNotepad())
 *      .attemptsTo(
 *          notes().set('my_note', 'some value'),
 *          Log.the(notes().get('my_note')),    // emits 'some value'
 *      );
 *
 * @example <caption>Using generics</caption>
 *  import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 *  interface MyNotes {
 *      personalDetails: {
 *          firstName: string;
 *          lastName: string;
 *      }
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.usingAnEmptyNotepad<MyNotes>())
 *      .attemptsTo(
 *          Log.the(notes<MyNotes>().has('personalDetails')),                       // emits false
 *          Log.the(notes<MyNotes>().get('personalDetails').isPresent()),           // emits false
 *
 *          notes<MyNotes>().set('personalDetails', { firstName: 'Leonard', lastName: 'McLaud' }),
 *
 *          Log.the(notes<MyNotes>().has('personalDetails')),                       // emits true
 *          Log.the(notes<MyNotes>().get('personalDetails').isPresent()),           // emits true
 *          Log.the(notes().get('personalDetails').firstName),                      // emits 'Leonard'
 *          Log.the(notes().get('personalDetails').firstName.toLocaleUpperCase()),  // emits 'LEONARD'
 *      );
 *
 * @example <caption>Populating the notepad with initial state</caption>
 *  import { actorCalled, Log, Note, Notepad, TakeNotes } from '@serenity-js/core';
 *
 *  interface MyNotes {
 *      firstName: string;
 *      lastName: string;
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(
 *          TakeNotes.using(Notepad.with<MyNotes>({
 *              firstName: 'Leonard',
 *              lastName: 'McLaud',
 *          })
 *      )
 *      .attemptsTo(
 *          notes<MyNotes>().set('lastName', 'Shelby'),
 *          Log.the(notes().get('firstName')),          // emits 'Leonard'
 *          Log.the(notes().get('lastName')),           // emits 'Shelby'
 *      );
 *
 * @example <caption>Recording a dynamic note</caption>
 *  import { actorCalled, Log, Notepad, notes, TakeNotes } from '@serenity-js/core';
 *  import { By, Text, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  interface OnlineShoppingNotes {
 *      promoCode: string;
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
 *          notes<OnlineShoppingNotes>().set('promoCode', Text.of(promoCode()),
 *          // ...
 *          Enter.theValue(notes<OnlineShoppingNotes>().get('promoCode'))
 *              .into(promoCodeInput())
 *      );
 *
 * @example <caption>Clearing a notepad before each test scenario (Mocha)</caption>
 * import 'mocha';
 *
 * beforeEach(() =>
 *   actorCalled('Leonard')
 *      .attemptsTo(
 *          notes().clear(),
 *      ));
 *
 * @example <caption>Clearing a notepad before each test scenario (Cucumber)</caption>
 * import { Before } from '@cucumber/cucumber';
 *
 * Before(() =>
 *   actorCalled('Leonard')
 *      .attemptsTo(
 *          notes().clear(),
 *      ));
 *
 * @example <caption>Importing notes from an API response</caption>
 *  // given an example API:
 *  //   GET /generate-test-user
 *  // which returns:
 *  //   { "first_name": "Leonard", "last_name": "Shelby" }
 *
 *  import { actorCalled, Log, Note, Notepad, TakeNotes } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, Send } from '@serenity-js/rest';
 *
 *  interface PersonalDetails {
 *      first_name: string;
 *      last_name: string;
 *  }
 *
 *  interface MyNotes {
 *      personalDetails?: PersonalDetails;
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(
 *          CallAnApi.at('https://api.example.org/'),
 *          TakeNotes.using(Notepad.empty<MyNotes>())
 *      )
 *      .attemptsTo(
 *          Send.a(GetRequest.to('/generate-test-user')),
 *          notes<MyNotes>().set('personalDetails', LastResponse.body<PersonalDetails>()),
 *
 *          Log.the(notes<MyNotes>().get('personalDetails').first_name),    // emits 'Leonard'
 *          Log.the(notes<MyNotes>().get('personalDetails').last_name),     // emits 'Shelby'
 *      );
 *
 * @example <caption>Using the QuestionAdapter</caption>
 *  import { actorCalled, Log, Notepad, notes, TakeNotes } from '@serenity-js/core';
 *
 *  interface AuthCredentials {
 *      username?: string;
 *      password?: string;
 *  }
 *
 *  interface MyNotes {
 *      auth: AuthCredentials;
 *  }
 *
 *  actorCalled('Leonard')
 *     .whoCan(
 *         TakeNotes.using(
 *             Notepad.with<MyNotes>({     // typed initial state
 *                 auth: {
 *                     username: 'leonard@example.org',
 *                     password: 'SuperSecretP@ssword!',
 *                 }
 *             })
 *         )
 *     )
 *     .attemptsTo(
 *         Log.the(
 *             notes<MyNotes>()            // typed notes
 *                 .get('auth')            // returns QuestionAdapter<AuthCredentials>
 *                 .password               // returns QuestionAdapter<string>
 *                 .charAt(0)
 *                 .toLocaleLowerCase(),   // emits "s"
 *         ),
 *     );
 *
 * @see {@link Note}
 * @see {@link Notepad}
 *
 * @implements {Ability}
 */
export class TakeNotes<Notes_Type extends Record<any, any>> implements Ability {
    /**
     * @desc
     *  Initialises an {@link Ability} to {@link TakeNotes} with {@link Notepad.empty}
     *
     * @returns {TakeNotes<N>}
     */
    static usingAnEmptyNotepad<N extends Record<any, any>>(): TakeNotes<N> {
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
    static using<N extends Record<any, any>>(notepad: Notepad<N>): TakeNotes<N> {
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
    static as<N extends Record<any, any>>(actor: UsesAbilities): TakeNotes<N> {
        return actor.abilityTo(TakeNotes) as TakeNotes<N>;
    }

    /**
     * @param {Notepad<Notes>} notepad
     * @protected
     */
    constructor(public readonly notepad: Notepad<Notes_Type>) {
    }
}
