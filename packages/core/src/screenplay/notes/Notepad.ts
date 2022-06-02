import { TinyType } from 'tiny-types';

import { LogicError } from '../../errors';
import { d } from '../../io';
import { Question, QuestionAdapter } from '../Question';
import { TakeNotes } from './TakeNotes';

/**
 * @desc
 *  Stores notes recorded by an {@link Actor}.
 *
 *  See {@link TakeNotes} and {@link notes} for more usage examples.
 *
 * @example <caption>Sharing a notepad between actors</caption>
 *  import { Actor, Cast, Notepad, TakeNotes } from '@serenity-js/core';
 *
 *  interface MyNotes {
 *      auth: {
 *        username: string;
 *        password: string;
 *      }
 *  }
 *
 *  export class Actors implements Cast {
 *
 *      // initialise a shared notepad when the Actors class is initialised
 *      private readonly sharedNotepad = Notepad.with<MyNotes>({
 *          auth: {
 *              username: 'test-user',
 *              password: 'SuperSecretP@ssword!',
 *          }
 *      });
 *
 *      prepare(actor: Actor): Actor {
 *          switch (actor.name) {
 *            case 'Alice':
 *            case 'Bob':
 *                // Alice and Bob will share their notepad
 *                return actor.whoCan(TakeNotes.using(this.sharedNotepad));
 *            default:
 *                // other actors will get their own notepads
 *               return actor.whoCan(TakeNotes.using(Notepad.empty<AuthCredentials>()));
 *          }
 *      }
 *  }
 *
 * @see {@link TakeNotes}
 * @see {@link notes}
 *
 * @extends {TinyType}
 */
export class Notepad<Notes extends Record<any, any>> extends TinyType {

    /**
     * @desc
     *  Instantiates a new empty Notepad.
     *
     * @returns {Notepad<N>}
     */
    static empty<N extends Record<any, any>>(): Notepad<N> {
        return new Notepad<N>({} as N);
    }

    /**
     * @desc
     *  Instantiates a new Notepad with an initial state.
     *
     * @example
     *  import { actorCalled, Notepad, notes, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  interface MyNotes {
     *      personalDetails: {
     *          firstName: string;
     *          lastName: string;
     *      }
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(
     *              Notepad.with<MyNotes>({
     *                  personalDetails: {
     *                      firstName: 'Leonard',
     *                      lastName: 'McLaud',
     *                  }
     *              })
     *          )
     *      )
     *      .attemptsTo(
     *          Ensure.that(
     *              notes<MyNotes>().get('personalDetails').firstName,
     *              equals('Leonard')
     *          ),
     *      );
     *
     * @param {N extends Record<any, any>} notes
     * @returns {Notepad<N>}
     */
    static with<N extends Record<any, any>>(notes: N): Notepad<N> {
        return new Notepad<N>(notes);
    }

    /**
     * @desc
     *  Creates a {@link QuestionAdapter} that simplifies access to the notes
     *  stored in this notepad. Allows the {@link Actor} to record, read, and remove notes.
     *
     *  See {@link TakeNotes} and {@link Notepad} for more usage examples.
     *
     * @returns {QuestionAdapter<Notepad<N>>}
     *
     * @see {@link notes}
     * @see {@link Notepad}
     * @see {@link TakeNotes}
     */
    static notes<N extends Record<any, any>>(): QuestionAdapter<Notepad<N>> {
        return Question.about('notes', actor => {
            return TakeNotes.as(actor).notepad;
        });
    }

    /**
     * @desc
     *  Instantiates a {@link Notepad} with an initial state.
     *
     * @param {Notes} notes
     * @protected
     */
    protected constructor(private readonly notes: Notes) {
        super();
    }

    /**
     * @desc
     *  Checks if a note identified by `subject` exists in the notepad.
     *
     * @param {Subject extends keyof Notes} subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns {boolean}
     *  `true` if the note exists, `false` otherwise
     */
    has<Subject extends keyof Notes>(subject: Subject): boolean {
        return Object.prototype.hasOwnProperty.call(this.notes, subject);
    }

    /**
     * @desc
     *  Retrieves a note, identified by `subject`, from the notepad.
     *
     * @param {Subject extends keyof Notes} subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns {Notes[Subject]}
     *  The value of the previously recorded note.
     *
     * @throws {LogicError}
     *  Throws a {@link LogicError} if the note with a given `subject`
     *  has never been recorded.
     */
    get<Subject extends keyof Notes>(subject: Subject): Notes[Subject] {
        if (! this.has(subject)) {
            throw new LogicError(d`Note of ${ subject } cannot be retrieved because it's never been recorded`);
        }

        return this.notes[subject];
    }

    /**
     * @desc
     *  Stores a given `value` uniquely identified by `subject` in the notepad.
     *
     * @param {Subject extends keyof Notes} subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @param {Notes[Subject]} value
     *  The value to record.
     *
     * @returns {Notepad<Notes>}
     */
    set<Subject extends keyof Notes>(subject: Subject, value: Notes[Subject]): Notepad<Notes> {
        this.notes[subject] = value;
        return this;
    }

    /**
     * @desc
     *  Removes the note identified by `subject` from the notepad.
     *
     * @param {Subject extends keyof Notes} subject
     *
     * @returns {boolean}
     *  `true` if the item in the Notepad object existed and has been removed,
     *  `false` otherwise.
     */
    delete<Subject extends keyof Notes>(subject: Subject): boolean {
        if (this.has(subject)) {
            return delete this.notes[subject];
        }
        return false;
    }

    /**
     * @desc
     *  Deletes all the notes stored in this notepad.
     *
     * @returns {void}
     */
    clear(): void {
        const keys = Object.keys(this.notes);

        for (const key of keys) {
            this.delete(key);
        }
    }

    /**
     * @desc
     *  Returns the number of notes stored in the notepad.
     *
     * @returns {number}
     */
    size(): number {
        return Object.keys(this.notes).length;
    }
}
