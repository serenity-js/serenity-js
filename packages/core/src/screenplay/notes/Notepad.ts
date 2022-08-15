import { TinyType } from 'tiny-types';

import { LogicError } from '../../errors';
import { d } from '../../io';
import { NotepadAdapter } from './NotepadAdapter';

/**
 * Stores notes recorded by an {@apilink Actor}.
 *
 * See {@apilink TakeNotes} and [notes](/api/core/function/notes) for more usage examples.
 *
 * ## Sharing a notepad between actors
 *
 * ```ts
 * import { Actor, Cast, Notepad, TakeNotes } from '@serenity-js/core'
 *
 * interface MyNotes {
 *   auth: {
 *     username: string;
 *     password: string;
 *   }
 * }
 *
 * export class Actors implements Cast {
 *
 *   // initialise a shared notepad when the Actors class is initialised
 *   private readonly sharedNotepad = Notepad.with<MyNotes>({
 *     auth: {
 *       username: 'test-user',
 *       password: 'SuperSecretP@ssword!',
 *     }
 *   });
 *
 *   prepare(actor: Actor): Actor {
 *     switch (actor.name) {
 *       case 'Alice':
 *       case 'Bob':
 *         // Alice and Bob will share their notepad
 *         return actor.whoCan(TakeNotes.using(this.sharedNotepad));
 *       default:
 *         // other actors will get their own notepads
 *         return actor.whoCan(TakeNotes.using(Notepad.empty<AuthCredentials>()));
 *     }
 *   }
 * }
 * ```
 *
 * ## Learn more
 *
 * - {@apilink TakeNotes}
 * - [notes](/api/core/function/notes)
 * - {@apilink Cast}
 *
 * @group Notes
 */
export class Notepad<Notes extends Record<any, any>> extends TinyType {

    /**
     * Instantiates a new empty Notepad.
     */
    static empty<N extends Record<any, any>>(): Notepad<N> {
        return new Notepad<N>({} as N);
    }

    /**
     * Instantiates a new Notepad with an initial state.
     *
     * ```ts
     * import { actorCalled, Notepad, notes, TakeNotes } from '@serenity-js/core'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * interface MyNotes {
     *   personalDetails: {
     *     firstName: string;
     *     lastName: string;
     *   }
     * }
     *
     * actorCalled('Leonard')
     *   .whoCan(
     *     TakeNotes.using(
     *       Notepad.with<MyNotes>({
     *         personalDetails: {
     *           firstName: 'Leonard',
     *           lastName: 'McLaud',
     *         }
     *       })
     *     )
     *   )
     *   .attemptsTo(
     *     Ensure.that(
     *       notes<MyNotes>().get('personalDetails').firstName,
     *       equals('Leonard')
     *     ),
     *   )
     * ```
     *
     * @param notes
     */
    static with<N extends Record<any, any>>(notes: N): Notepad<N> {
        return new Notepad<N>(notes);
    }

    /**
     * Creates a {@apilink QuestionAdapter} that simplifies access to the notes
     * stored in this notepad. Allows the {@apilink Actor} to record, read, and remove notes.
     *
     * #### Learn more
     * - [notes](/api/core/function/notes)
     * - {@apilink TakeNotes}
     * - {@apilink Notepad}
     */
    static notes<N extends Record<any, any>>(): NotepadAdapter<N> {
        return new NotepadAdapter<N>();
    }

    /**
     * Instantiates a {@apilink Notepad} with an initial state.
     *
     * @param recordedNotes
     *  Initial state of the notepad
     */
    protected constructor(private readonly recordedNotes: Notes) {
        super();
    }

    /**
     * Checks if a note identified by `subject` exists in the notepad.
     *
     * @param subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns
     *  `true` if the note exists, `false` otherwise
     */
    has<Subject extends keyof Notes>(subject: Subject): boolean {
        return Object.prototype.hasOwnProperty.call(this.recordedNotes, subject);
    }

    /**
     * Retrieves a note, identified by `subject`, from the notepad.
     *
     * @param subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns
     *  The value of the previously recorded note.
     *
     * @throws {@apilink LogicError}
     *  Throws a {@apilink LogicError} if the note with a given `subject`
     *  has never been recorded.
     */
    get<Subject extends keyof Notes>(subject: Subject): Notes[Subject] {
        if (! this.has(subject)) {
            throw new LogicError(d`Note of ${ subject } cannot be retrieved because it's never been recorded`);
        }

        return this.recordedNotes[subject];
    }

    /**
     * Stores a given `value` uniquely identified by `subject` in the notepad.
     *
     * @param subject
     *  A subject (name) that uniquely identifies a given note
     *
     * @param value
     *  The value to record.
     */
    set<Subject extends keyof Notes>(subject: Subject, value: Notes[Subject]): Notepad<Notes> {
        this.recordedNotes[subject] = value;
        return this;
    }

    /**
     * Removes the note identified by `subject` from the notepad.
     *
     * @param subject
     *
     * @returns
     *  `true` if the item in the Notepad object existed and has been removed,
     *  `false` otherwise.
     */
    delete<Subject extends keyof Notes>(subject: Subject): boolean {
        if (this.has(subject)) {
            return delete this.recordedNotes[subject];
        }
        return false;
    }

    /**
     * Deletes all the notes stored in this notepad.
     */
    clear(): void {
        const keys = Object.keys(this.recordedNotes);

        for (const key of keys) {
            this.delete(key);
        }
    }

    /**
     * Returns the number of notes stored in the notepad.
     */
    size(): number {
        return Object.keys(this.recordedNotes).length;
    }
}
