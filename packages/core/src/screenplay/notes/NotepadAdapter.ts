import { JSONObject } from 'tiny-types';

import { commaSeparated } from '../../io';
import { Actor } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { Question, QuestionAdapter } from '../Question';
import { ChainableSetter } from './ChainableSetter';
import { TakeNotes } from './TakeNotes';

/**
 * @desc
 *  Screenplay Pattern-style adapter for the {@link Notepad},
 *  making it easier for the {@link Actor}s to access its APIs.
 *
 *  See {@link TakeNotes}, {@link Notepad} and {@link notes} for more examples.
 *
 *  @implements {ChainableSetter<Notes>}
 */
export class NotepadAdapter<Notes extends Record<any, any>> implements ChainableSetter<Notes> {

    /**
     * @desc
     *  Checks if a note identified by `subject` exists in the notepad.
     *
     * @param {Subject extends keyof Notes} subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @returns {Question<Promise<boolean>>}
     *  Question that resolves to `true` if the note exists, `false` otherwise
     *
     * @see {@link Notepad#has}
     */
    has<Subject extends keyof Notes>(subject: Subject): Question<Promise<boolean>> {
        return Question.about(`a note of ${ String(subject) } exists`, actor => {
            return TakeNotes.as(actor).notepad.has(subject);
        });
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
     *
     * @see {@link Notepad#get}
     */
    get<Subject extends keyof Notes>(subject: Subject): QuestionAdapter<Notes[Subject]> {
        return Question.about(`a note of ${ String(subject) }`, actor => {
            return TakeNotes.as(actor).notepad.get(subject);
        });
    }

    /**
     * @desc
     *  Resolves a given `Answerable<value>` and stores it in the notepad,
     *  uniquely identified by its `subject`.
     *
     *  **Pro tip:** calls to `set` can be chained and result in an accumulation
     *  of values to be recorded in the {@link Notepad}.
     *  Those values are resolved and recorded when the {@link Interaction}
     *  returned by this method is performed by an {@link Actor}.
     *
     *  If a note identified by a given `subject` is set multiple times,
     *  the last call wins.
     *
     * @example
     *  import { actorCalled, notes, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  interface MyNotes {
     *      stringNote: string;
     *      numberNote: number;
     *  }
     *
     *  actorCalled('Alice')
     *    .whoCan(TakeNotes.usingAnEmptyNotepad<MyNotes>());
     *    .attemptsTo(
     *
     *      notes<MyNotes>()
     *        .set('stringNote', 'example')
     *        .set('numberNote', Promise.resolve(42))
     *        .set('stringNote', 'another example'),
     *
     *      Ensure.equal(notes().toJSON(), {
     *        firstNote: 'another example',
     *        secondNote: 42,
     *      })
     *  );
     *
     * @param {Subject extends keyof Notes} subject
     *   A subject (name) that uniquely identifies a given note
     *
     * @param {Answerable<Notes[Subject]>} value
     *  The value to record.
     *
     * @returns {ChainableSetter<Notes> & Interaction}
     *
     * @see {@link Notepad#set}
     */
    set<Subject extends keyof Notes>(subject: Subject, value: Answerable<Notes[Subject]>): ChainableSetter<Notes> & Interaction {
        return new ChainableNoteSetter<Notes>({ [subject]: value } as NotesToSet<Notes>);
    }

    /**
     * @desc
     *  Removes the note identified by `subject` from the notepad.
     *
     * @example <caption>Using as an Interaction</caption>
     *  import { actorCalled, Check, Log, notes } from '@serenity-js/core';
     *  import { isPresent } from '@serenity-js/assertions';
     *
     *  interface MyNotes {
     *    myNote: string;
     *  }
     *
     *  actorCalled('Alice')
     *    .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *    .attemptsTo(
     *      notes<MyNotes>().set('myNote', 'example value'),
     *
     *      notes<MyNotes>().delete('myNote'),
     *
     *      Check.whether(notes<MyNotes>().get('myNote'), isPresent())
     *        .andIfSo(
     *          Log.the('myNote is present'),
     *        )
     *        .otherwise(
     *          Log.the('myNote was deleted'),
     *        )
     *    )
     *    // logs: myNote was deleted
     *
     * @example <caption>Using as a Question</caption>
     *  import { actorCalled, Check, Log, notes } from '@serenity-js/core';
     *  import { isTrue } from '@serenity-js/assertions';
     *
     *  interface MyNotes {
     *    myNote: string;
     *  }
     *
     *  actorCalled('Alice')
     *    .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *    .attemptsTo(
     *      notes<MyNotes>().set('myNote', 'example value'),
     *
     *      Check.whether(notes<MyNotes>().delete('myNote'), isTrue())
     *        .andIfSo(
     *          Log.the('myNote was deleted'),
     *        )
     *        .otherwise(
     *          Log.the('myNote could not be deleted because it was not set'),
     *        )
     *    )
     *    // logs: myNote was deleted
     *
     * @param {Subject extends keyof Notes} subject
     *
     * @returns {QuestionAdapter<boolean>}
     *  When used as a `Question`, resolves to `true` if the item in the Notepad object existed and has been removed,
     *  `false` otherwise.
     *
     * @see {@link Notepad#delete}
     */
    delete<Subject extends keyof Notes>(subject: Subject): QuestionAdapter<boolean> {
        return Question.about(`#actor deletes a note of ${ String(subject) }`, actor => {
            return TakeNotes.as(actor).notepad.delete(subject);
        });
    }

    /**
     * @desc
     *  Deletes all the notes stored in this notepad.
     *
     * @example
     *  import { actorCalled, notes } from '@serenity-js/core';
     *  import { isTrue } from '@serenity-js/assertions';
     *
     *  interface MyNotes {
     *    myNote: string;
     *  }
     *
     *  actorCalled('Alice')
     *    .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *    .attemptsTo(
     *      notes<MyNotes>().set('myNote', 'example value'),
     *      Log.the(notes<MyNotes>().size()),   // emits 1
     *      notes<MyNotes>().clear(),
     *      Log.the(notes<MyNotes>().size()),   // emits 0
     *    )
     *
     * @returns {Interaction}
     *
     * @see {@link Notepad#clear}
     */
    clear(): Interaction {
        return Interaction.where('#actor clears their notepad', actor => {
            return TakeNotes.as(actor).notepad.clear();
        });
    }

    /**
     * @desc
     *  Returns the number of notes stored in the notepad.
     *
     * @example
     *  import { actorCalled, notes } from '@serenity-js/core';
     *  import { isTrue } from '@serenity-js/assertions';
     *
     *  interface MyNotes {
     *    myNote: string;
     *  }
     *
     *  actorCalled('Alice')
     *    .whoCan(TakeNotes.using(Notepad.empty<MyNotes>()))
     *    .attemptsTo(
     *      Log.the(notes<MyNotes>().size()),   // emits 0
     *      notes<MyNotes>().set('myNote', 'example value'),
     *      Log.the(notes<MyNotes>().size()),   // emits 1
     *    )
     *
     * @returns {QuestionAdapter<number>}
     *
     * @see {@link Notepad#size}
     */
    size(): QuestionAdapter<number> {
        return Question.about('number of notes', async actor => {
            return TakeNotes.as(actor).notepad.size();
        });
    }

    /**
     * @desc
     *  Produces a {@link QuestionAdapter} that resolves to a {@link tiny-types~JSONObject}
     *  representing the resolved notes stored in the notepad.
     *
     *  Note that serialisation to JSON will simplify some data types that might not be serialisable by default,
     *  but are commonly used in data structures representing actor's notes.
     *  For example a {@link Map} will be serialised as a regular JSON object, a {@link Set} will be serialised as {@link Array}.
     *
     *  Additionally, notepad assumes that the data structure you use it with does not contain cyclic references.
     *
     *  To learn more about the serialisation mechanism used by the notepad, please refer to {@link tiny-types~TinyType}.
     *
     * @example
     *  import { actorCalled, notes } from '@serenity-js/core';
     *
     *  actorCalled('Alice')
     *    .whoCan(TakeNotes.using(Notepad.with({
     *        aSet: new Set(['apples', 'bananas', 'cucumbers']),
     *        aPromisedValue: Promise.resolve(42),
     *        aString: 'example'
     *    })))
     *    .attemptsTo(
     *      Log.the(notes().toJSON()),
     *    )
     *    // emits: {
     *    //    aSet: ['apples', 'bananas', 'cucumbers']
     *    //    aPromisedValue: 42,
     *    //    aString: 'example',
     *    // }
     *
     * @returns {QuestionAdapter<tiny-types~JSONObject>}
     */
    toJSON(): QuestionAdapter<JSONObject> {
        return Question.about('notepad serialised to JSON', async actor => {
            return TakeNotes.as(actor).notepad.toJSON() as JSONObject;
        });
    }

    /**
     * @returns {string}
     */
    toString(): string {
        return 'notes';
    }
}

type NotesToSet<Notes extends Record<any, any>> = {
    [Subject in keyof Notes]?: Answerable<Notes[Subject]>
}

class ChainableNoteSetter<Notes extends Record<any, any>> extends Interaction implements ChainableSetter<Notes> {

    constructor(private readonly notes: NotesToSet<Notes>) {
        super();
    }

    set<K extends keyof Notes>(subject: K, value: Answerable<Notes[K]>): ChainableSetter<Notes> & Interaction {
        return new ChainableNoteSetter({
            ...this.notes,
            [subject]: value,
        } as NotesToSet<Notes>)
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Interaction}.
     *
     * @param {Actor} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     */
    async performAs(actor: Actor): Promise<void> {

        const notepad = TakeNotes.as<Notes>(actor).notepad;

        for (const [ subject, value ] of Object.entries(this.notes)) {
            const answer = await actor.answer(value);
            notepad.set(subject, answer);
        }
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor takes note of ${ commaSeparated(Object.keys(this.notes)) }`;
    }
}

