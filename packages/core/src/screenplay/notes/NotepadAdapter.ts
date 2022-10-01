import { JSONObject } from 'tiny-types';

import { commaSeparated } from '../../io';
import { Actor } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { Question, QuestionAdapter } from '../Question';
import { ChainableSetter } from './ChainableSetter';
import { TakeNotes } from './TakeNotes';

/**
 * Serenity/JS Screenplay Pattern-style adapter for the {@apilink Notepad},
 * that makes it easier for the {@apilink Actor|actors} to access its APIs.
 *
 * See {@apilink TakeNotes}, {@apilink Notepad} and {@apilink notes} for more examples.
 *
 * @group Notes
 */
export class NotepadAdapter<Notes extends Record<any, any>> implements ChainableSetter<Notes> {

    /**
     * Checks if a note identified by `subject` exists in the notepad.
     *
     * #### Learn more
     * - {@apilink Notepad.has}
     *
     * @param subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns
     *  Question that resolves to `true` if the note exists, `false` otherwise
     */
    has<Subject extends keyof Notes>(subject: Subject): QuestionAdapter<boolean> {
        return Question.about(`a note of ${ String(subject) } exists`, actor => {
            return TakeNotes.as(actor).notepad.has(subject);
        });
    }

    /**
     * Retrieves a note, identified by `subject`, from the notepad.
     *
     * #### Learn more
     * - {@apilink Notepad.get}
     *
     * @param subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns
     *  The value of the previously recorded note.
     *
     * @throws {LogicError}
     *  Throws a {@apilink LogicError} if the note with a given `subject`
     *  has never been recorded.
     */
    get<Subject extends keyof Notes>(subject: Subject): QuestionAdapter<Notes[Subject]> {
        return Question.about(`a note of ${ String(subject) }`, actor => {
            return TakeNotes.as(actor).notepad.get(subject);
        });
    }

    /**
     * Resolves a given `Answerable<value>` and stores it in the notepad,
     * uniquely identified by its `subject`.
     *
     * **Pro tip:** calls to `set` can be chained and result in an accumulation
     * of values to be recorded in the {@apilink Notepad}.
     * Those values are resolved and recorded when the {@apilink Interaction}
     * returned by this method is performed by an {@apilink Actor}.
     *
     * If a note identified by a given `subject` is set multiple times,
     * the last call wins.
     *
     * ```ts
     *  import { actorCalled, notes, TakeNotes } from '@serenity-js/core'
     *  import { Ensure, equals } from '@serenity-js/assertions'
     *
     *  interface MyNotes {
     *      stringNote: string;
     *      numberNote: number;
     *  }
     *
     * await actorCalled('Alice')
     *   .whoCan(TakeNotes.usingAnEmptyNotepad<MyNotes>());
     *   .attemptsTo(
     *
     *     notes<MyNotes>()
     *       .set('stringNote', 'example')
     *       .set('numberNote', Promise.resolve(42))
     *       .set('stringNote', 'another example'),
     *
     *     Ensure.equal(notes().toJSON(), {
     *       firstNote: 'another example',
     *       secondNote: 42,
     *     })
     * )
     * ```
     *
     * #### Learn more
     * - {@apilink Notepad.set}
     *
     * @param subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @param value
     *  The value to record
     */
    set<Subject extends keyof Notes>(subject: Subject, value: Answerable<Notes[Subject]>): ChainableSetter<Notes> & Interaction {
        return new ChainableNoteSetter<Notes>({ [subject]: value } as NotesToSet<Notes>);
    }

    /**
     * Removes the note identified by `subject` from the notepad.
     *
     * #### Using as an `Interaction`
     *
     * ```ts
     * import { actorCalled, Check, Log, notes } from '@serenity-js/core'
     * import { isPresent } from '@serenity-js/assertions'
     *
     * interface MyNotes {
     *   myNote: string;
     * }
     *
     * await actorCalled('Alice')
     *   .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *   .attemptsTo(
     *     notes<MyNotes>().set('myNote', 'example value'),
     *
     *     notes<MyNotes>().delete('myNote'),
     *
     *     Check.whether(notes<MyNotes>().get('myNote'), isPresent())
     *       .andIfSo(
     *         Log.the('myNote is present'),
     *       )
     *       .otherwise(
     *         Log.the('myNote was deleted'),
     *       )
     *   )
     *   // logs: myNote was deleted
     * ```
     *
     * #### Using as a `Question`
     *
     * ```ts
     * import { actorCalled, Check, Log, notes } from '@serenity-js/core'
     * import { isTrue } from '@serenity-js/assertions'
     *
     * interface MyNotes {
     *   myNote: string;
     * }
     *
     * await actorCalled('Alice')
     *   .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *   .attemptsTo(
     *     notes<MyNotes>().set('myNote', 'example value'),
     *
     *     Check.whether(notes<MyNotes>().delete('myNote'), isTrue())
     *       .andIfSo(
     *         Log.the('myNote was deleted'),
     *       )
     *       .otherwise(
     *         Log.the('myNote could not be deleted because it was not set'),
     *       )
     *   )
     *   // logs: myNote was deleted
     * ```
     *
     * #### Learn more
     * - {@apilink Notepad.delete}
     *
     * @param subject
     *
     * @returns
     *  When used as a `Question`, resolves to `true` if the item in the Notepad object existed and has been removed,
     *  `false` otherwise.
     */
    delete<Subject extends keyof Notes>(subject: Subject): QuestionAdapter<boolean> {
        return Question.about(`#actor deletes a note of ${ String(subject) }`, actor => {
            return TakeNotes.as(actor).notepad.delete(subject);
        });
    }

    /**
     * Deletes all the notes stored in this notepad.
     *
     * ```ts
     * import { actorCalled, notes } from '@serenity-js/core'
     * import { isTrue } from '@serenity-js/assertions'
     *
     * interface MyNotes {
     *   myNote: string;
     * }
     *
     * await actorCalled('Alice')
     *   .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *   .attemptsTo(
     *     notes<MyNotes>().set('myNote', 'example value'),
     *     Log.the(notes<MyNotes>().size()),   // emits 1
     *     notes<MyNotes>().clear(),
     *     Log.the(notes<MyNotes>().size()),   // emits 0
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Notepad.clear}
     */
    clear(): Interaction {
        return Interaction.where('#actor clears their notepad', actor => {
            return TakeNotes.as(actor).notepad.clear();
        });
    }

    /**
     * Returns the number of notes stored in the notepad.
     *
     * ```ts
     * import { actorCalled, notes } from '@serenity-js/core'
     * import { isTrue } from '@serenity-js/assertions'
     *
     * interface MyNotes {
     *   myNote: string;
     * }
     *
     * await actorCalled('Alice')
     *   .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *   .attemptsTo(
     *     Log.the(notes<MyNotes>().size()),   // emits 0
     *     notes<MyNotes>().set('myNote', 'example value'),
     *     Log.the(notes<MyNotes>().size()),   // emits 1
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Notepad.size}
     */
    size(): QuestionAdapter<number> {
        return Question.about('number of notes', async actor => {
            return TakeNotes.as(actor).notepad.size();
        });
    }

    /**
     * Produces a {@apilink QuestionAdapter} that resolves to a `JSONObject`
     * representing the resolved notes stored in the notepad.
     *
     * Note that serialisation to JSON will simplify some data types that might not be serialisable by default,
     * but are commonly used in data structures representing actor's notes.
     * For example a {@apilink Map} will be serialised as a regular JSON object, a {@apilink Set} will be serialised as {@apilink Array}.
     *
     * Additionally, notepad assumes that the data structure you use it with does not contain cyclic references.
     *
     * To learn more about the serialisation mechanism used by the notepad, please refer to [TinyTypes documentation](https://jan-molak.github.io/tiny-types/).
     *
     * ```ts
     * import { actorCalled, notes } from '@serenity-js/core'
     *
     * await actorCalled('Alice')
     *   .whoCan(TakeNotes.using(Notepad.with({
     *     aSet: new Set(['apples', 'bananas', 'cucumbers']),
     *     aPromisedValue: Promise.resolve(42),
     *     aString: 'example'
     *   })))
     *   .attemptsTo(
     *     Log.the(notes().toJSON()),
     *   )
     *   // emits: {
     *   //    aSet: ['apples', 'bananas', 'cucumbers']
     *   //    aPromisedValue: 42,
     *   //    aString: 'example',
     *   // }
     * ```
     */
    toJSON(): QuestionAdapter<JSONObject> {
        return Question.about('notepad serialised to JSON', async actor => {
            return TakeNotes.as(actor).notepad.toJSON() as JSONObject;
        });
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return 'notes';
    }
}

type NotesToSet<Notes extends Record<any, any>> = {
    [Subject in keyof Notes]?: Answerable<Notes[Subject]>
}

/**
 * @package
 */
class ChainableNoteSetter<Notes extends Record<any, any>> extends Interaction implements ChainableSetter<Notes> {

    constructor(private readonly notes: NotesToSet<Notes>) {
        super(`#actor takes note of ${ commaSeparated(Object.keys(notes)) }`);
    }

    set<K extends keyof Notes>(subject: K, value: Answerable<Notes[K]>): ChainableSetter<Notes> & Interaction {
        return new ChainableNoteSetter({
            ...this.notes,
            [subject]: value,
        } as NotesToSet<Notes>)
    }

    async performAs(actor: Actor): Promise<void> {

        const notepad = TakeNotes.as<Notes>(actor).notepad;

        for (const [ subject, value ] of Object.entries(this.notes)) {
            const answer = await actor.answer(value);
            notepad.set(subject, answer);
        }
    }
}
