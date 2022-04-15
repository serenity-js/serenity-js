import { LogicError } from '../../errors';
import { d } from '../../io';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { TakeNotes } from './TakeNotes';

/**
 * @desc
 *  Stores notes recorded by an {@link Actor}.
 *
 *  See {@link TakeNotes} and {@link Note} for more usage examples.
 *
 * @example <caption>Sharing a notepad between actors</caption>
 *  import { Actor, Cast, Notepad, TakeNotes } from '@serenity-js/core';
 *
 *  interface AuthCredentials {
 *      username?: string;
 *      password?: string;
 *  }
 *
 *  export class Actors implements Cast {
 *
 *      // initialise a shared notepad when the Actors class is initialised
 *      private readonly sharedNotepad = Notepad.with<AuthCredentials>({
 *          username: 'test-user',
 *          password: 'SuperSecretP@ssword!',
 *      });
 *
 *      prepare(actor: Actor): Actor {
 *          switch (actor.name) {}
 *            case 'Alice':
 *            case 'Bob':
 *                // Alice and Bob should share notes
 *                return actor.whoCan(TakeNotes.using(this.sharedNotepad));
 *            default:
 *                // other actors should have their own notepads
 *               return actor.whoCan(TakeNotes.using(Notepad.empty<AuthCredentials>()));
 *          }
 *      }
 *  }
 *
 * @see {@link TakeNotes}
 * @see {@link Note}
 *
 * @extends {Record<string, any>}
 */
export class Notepad<Notes extends Record<string, any>> {

    /**
     * @desc
     *  Instantiates a new empty Notepad.
     *
     * @returns {Notepad<N>}
     */
    static empty<N extends Record<string, any>>(): Notepad<N> {
        return new Notepad<N>({});
    }

    /**
     * @desc
     *  Instantiates a new Notepad with an initial state.
     *
     * @example
     *  import { actorCalled, Note, Notepad, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  interface PersonalDetails {
     *      first_name: string;
     *      last_name: string;
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(
     *              Notepad.with<PersonalDetails>({
     *                  first_name: 'Leonard',
     *              })
     *          )
     *      )
     *      .attemptsTo(
     *          Ensure.that(
     *              Note.of<PersonalDetails>('first_name'),
     *              equals('Leonard')
     *          ),
     *      );
     *
     * @param {Partial<N>} notes
     * @returns {Notepad<N>}
     */
    static with<N extends Record<string, any>>(notes: Partial<N>): Notepad<N> {
        return new Notepad<N>(notes);
    }

    /**
     * @desc
     *  Imports notes to be combined with any already existing ones.
     *
     *  **Please note** that this is a shallow merge internally performed by {@link Object.assign}.
     *  If the `notes` object contains a note under key called `my_note`,
     *  and a note has already been recorded under the same key, the imported note will overwrite
     *  the existing note.
     *
     * @example
     *  import { actorCalled, Note, Notepad, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  interface PersonalDetails {
     *      first_name: string;
     *      last_name: string;
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(
     *              Notepad.with<PersonalDetails>({
     *                  first_name: 'Leo',
     *                  last_name: 'Shelby',
     *              })
     *          )
     *      )
     *      .attemptsTo(
     *          Notepad.import<PersonalDetails>({
     *              first_name: 'Leonard',
     *          }),
     *
     *          Ensure.that(
     *              Note.of<PersonalDetails>('first_name'),
     *              equals('Leonard')
     *          ),
     *          Ensure.that(
     *              Note.of<PersonalDetails>('last_name'),
     *              equals('Shelby')
     *          ),
     *      );
     *
     * @param {Answerable<Partial<N>>} notes
     *  The notes to be imported by the {@link Actor} performing this interaction
     *
     * @returns {Interaction}
     */
    static import<N extends Record<string, any>>(notes: Answerable<Partial<N>>): Interaction {
        return Interaction.where(`#actor imports notes`, async actor => {
            const notesToImport = await actor.answer(notes);
            TakeNotes.as<N>(actor).import(notesToImport);
        });
    }

    /**
     * @desc
     *  Removes all the notes from the {@link Notepad} held by the {@link Actor}
     *  performing this {@link Interaction}.
     *
     * @example
     *  import { actorCalled, Note, Notepad, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, isPresent, not } from '@serenity-js/assertions';
     *
     *  interface PersonalDetails {
     *      first_name: string;
     *      last_name: string;
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(
     *              Notepad.with<PersonalDetails>({
     *                  first_name: 'Leonard',
     *                  last_name: 'Shelby',
     *              })
     *          )
     *      )
     *      .attemptsTo(
     *          Notepad.clear(),
     *
     *          Ensure.that(
     *              Note.of<PersonalDetails>('first_name'),
     *              not(isPresent())
     *          ),
     *          Ensure.that(
     *              Note.of<PersonalDetails>('last_name'),
     *              not(isPresent())
     *          ),
     *      );
     *
     * @returns {Interaction}
     */
    static clear(): Interaction {
        return Interaction.where(`#actor removes all notes from their notepad`, async actor => {
            TakeNotes.as(actor).clearNotepad();
        });
    }

    /**
     * @desc
     *  Instantiates a {@link Notepad} with an initial state.
     *
     * @param {Partial<Notes>} notes
     * @protected
     */
    protected constructor(private readonly notes: Partial<Notes>) {
    }

    /**
     * @desc
     *  Imports `notes` and combines them with ones that already exist in the notepad.
     *
     * @param {Partial<Notes>} notes
     * @returns {void}
     */
    import(notes: Partial<Notes>): void {
        Object.assign(this.notes, notes);
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
    read<Subject extends keyof Notes>(subject: Subject): Notes[Subject] {
        if (! this.has(subject)) {
            throw new LogicError(d`Note of ${ subject } cannot be retrieved because it's never been recorded`);
        }

        return this.notes[subject];
    }

    /**
     * @desc
     *  Checks if a note identified by `subject` exists in a notepad.
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
     *  Stores a given `value`, uniquely identified by `subject`, in a notepad.
     *
     * @param {Subject extends keyof Notes} subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @param {Notes[Subject]} value
     *  The value to remember
     *
     * @returns {Notepad}
     */
    write<Subject extends keyof Notes>(subject: Subject, value: Notes[Subject]): this {
        this.notes[subject] = value;
        return this;
    }

    /**
     * @desc
     *  Removes the note, identified by `subject`, from the notepad.
     *
     * @param {keyof Notes} subject
     * @returns {boolean}
     *  `true` if the item in the Notepad object existed and has been removed, `false` otherwise.
     */
    remove<Subject extends keyof Notes>(subject: Subject): boolean {
        if (this.has(subject)) {
            return delete this.notes[subject];
        }
        return false;
    }

    /**
     * @desc
     *  Deletes all the notes stored in the notepad.
     *
     * @returns {void}
     */
    clear(): void {
        const keys = Object.keys(this.notes) as Array<keyof Notes>;

        for (const key of keys) {
            this.remove(key);
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
