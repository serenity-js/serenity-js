import { QuestionAdapter } from '../Question';
import { Notepad } from './Notepad';

/**
 * @desc
 *  Alias for {@link Notepad.notes}.
 *
 * **Pro tip:** `notes<T>().get(subject)` returns a {@link QuestionAdapter} to make accessing the APIs
 *  of the underlying type easier.
 *
 * @example <caption>Working with untyped notes</caption>
 *  import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.usingAnEmptyNotepad())
 *      .attemptsTo(
 *          notes().set('my_note', 'some value'),
 *          Log.the(notes().get('my_note')),                        // emits "some value"
 *          Log.the(notes().get('my_note').toLocaleUpperCase()),    // emits "SOME VALUE"
 *      );
 *
 * @example <caption>Working with typed notes</caption>
 *  import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 *  interface MyNotes {
 *      username: string;
 *      token?: string;     // optional value
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.using(Notepad.with<MyNotes>({
 *          username: 'Leonard.McLaud@example.org',
 *      }))
 *      .attemptsTo(
 *          notes<MyNotes>().set('token', 'my-auth-token')
 *          Log.the(notes<MyNotes>().get('token').length),  // emits 13
 *
 *          Log.the(notes<MyNotes>().get('username').toLocaleLowerCase()),  // emits 'leonard.mclaud@example.org'
 *      );
 *
 * @example <caption>Checking if a note is present</caption>
 *  import { actorCalled, Check, notes, TakeNotes } from '@serenity-js/core';
 *  import { isPresent } from '@serenity-js/assertions';
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.using(Notepad.empty()))
 *      .attemptsTo(
 *          Check.whether(notes().get('token'), isPresent())
 *              .andIfSo(
 *                  Authenticate.using(notes().get('token')),
 *              )
 *              .otherwise(
 *                  SignIn.using('username', 'password'),
 *              )
 *      );
 *
 * @example <caption>Working with complex data structures</caption>
 *  import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 *  interface MyNotes {
 *      recordedItems: string[];
 *  }
 *
 *  actorCalled('Leonard')
 *      .whoCan(TakeNotes.using(Notepad.with<MyNotes>({
 *          recordedItems: [],
 *      }))
 *      .attemptsTo(
 *          // push 3 items
 *          notes().get('recordedItems').push('apples'),
 *          notes().get('recordedItems').push('cucumbers'),
 *          notes().get('recordedItems').push('bananas'),
 *
 *          // use QuestionAdapter to access Array.sort()
 *          notes().get('recordedItems').sort(),
 *
 *          Log.the(notes().get('recordedItems')),
 *            // emits 'apples', 'bananas', 'cucumbers'
 *      );
 *
 * @returns {QuestionAdapter<Notepad<N>>}
 *
 * @see {@link Notepad.notes}
 */
export function notes<N extends Record<any, any>>(): QuestionAdapter<Notepad<N>> {
    return Notepad.notes<N>();
}
