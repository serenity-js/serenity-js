import { Notepad } from './Notepad';
import type { NotepadAdapter } from './NotepadAdapter';

/**
 * Alias for [`Notepad.notes`](https://serenity-js.org/api/core/class/Notepad/#notes).
 *
 * **Pro tip:** `notes<T>().get(subject)` returns a [`NotepadAdapter`](https://serenity-js.org/api/core/class/NotepadAdapter/) to make accessing the APIs
 * of the underlying type easier. Check [`NotepadAdapter`](https://serenity-js.org/api/core/class/NotepadAdapter/) for more examples.
 *
 * ## Working with untyped notes
 *
 * You can use `notes<T>()` without parameterising it with an [interface](https://www.typescriptlang.org/docs/handbook/interfaces.html)
 * describing the structure of your notes.
 *
 * **Note:** this approach _is not type-safe_ and the type-safe alternative presented below should be used in most cases.
 *
 * ```ts
 * import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 * await actorCalled('Leonard')
 *   .whoCan(TakeNotes.usingAnEmptyNotepad())
 *   .attemptsTo(
 *     notes().set('my_note', 'some value'),
 *
 *     Log.the(notes().get('my_note')),
 *     // emits "some value"
 *
 *     Log.the(notes().get('my_note').toLocaleUpperCase()),
 *     // emits "SOME VALUE"
 *   );
 * ```
 *
 * ## Working with typed notes
 *
 * The **recommended** way to use `notes<T>()` is to parameterise it
 * with an [interface](https://www.typescriptlang.org/docs/handbook/interfaces.html)
 * describing the structure of your notes.
 *
 * **Note:** this approach _is type-safe_.
 *
 * ```ts
 * import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core';
 *
 * interface MyNotes {
 *   username: string;
 *   token?: string;     // optional value
 * }
 *
 * await actorCalled('Leonard')
 *   .whoCan(TakeNotes.using(Notepad.with<MyNotes>({
 *     username: 'Leonard.McLaud@example.org',
 *   }))
 *   .attemptsTo(
 *     notes<MyNotes>().set('token', 'my-auth-token')
 *
 *     Log.the(notes<MyNotes>().get('token').length),
 *     // emits 13
 *
 *     Log.the(notes<MyNotes>().get('username').toLocaleLowerCase()),
 *     // emits 'leonard.mclaud@example.org'
 *   )
 * ```
 *
 * ## Checking if a note is present
 *
 * ```ts
 * import { actorCalled, Check, notes, TakeNotes } from '@serenity-js/core'
 * import { isPresent } from '@serenity-js/assertions'
 *
 * await actorCalled('Leonard')
 *   .whoCan(TakeNotes.using(Notepad.empty()))
 *   .attemptsTo(
 *     Check.whether(notes().get('token'), isPresent())
 *      .andIfSo(
 *        Authenticate.using(notes().get('token')),
 *      )
 *      .otherwise(
 *        SignIn.using('username', 'password'),
 *      )
 *    )
 * ```
 *
 * ## Working with complex data structures
 *
 * ```ts
 * import { actorCalled, Log, notes, TakeNotes } from '@serenity-js/core'
 *
 * interface MyNotes {
 *   recordedItems: string[];
 * }
 *
 * await actorCalled('Leonard')
 *   .whoCan(TakeNotes.using(Notepad.with<MyNotes>({
 *     recordedItems: [],
 *   }))
 *   .attemptsTo(
 *      // push 3 items
 *      notes().get('recordedItems').push('apples'),
 *      notes().get('recordedItems').push('cucumbers'),
 *      notes().get('recordedItems').push('bananas'),
 *
 *      // use QuestionAdapter to access Array.sort()
 *      notes().get('recordedItems').sort(),
 *
 *      Log.the(notes().get('recordedItems')),
 *      // emits 'apples', 'bananas', 'cucumbers'
 *   )
 * ```
 *
 * ## Learn more
 *
 * - [`NotepadAdapter`](https://serenity-js.org/api/core/class/NotepadAdapter/)
 * - [`Notepad.notes`](https://serenity-js.org/api/core/class/Notepad/#notes)
 * - [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 *
 * @group Notes
 */
export function notes<N extends Record<any, any>>(): NotepadAdapter<N> {
    return Notepad.notes<N>();
}
