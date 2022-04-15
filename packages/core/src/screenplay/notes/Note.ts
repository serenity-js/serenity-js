import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { Question, QuestionAdapter } from '../Question';
import { TakeNotes } from './TakeNotes';

/**
 * @desc
 *  A Screenplay Pattern-style adapter around the {@link Actor}'s {@link Notepad}.
 *  Allows the {@link Actor} to record, read, and remove notes.
 *
 *  See {@link TakeNotes} and {@link Notepad} for more usage examples.
 *
 * @see {@link TakeNotes}
 * @see {@link Notepad}
 */
export class Note {

    /**
     * @desc
     *  Retrieves a previously recorded note, identified by `subject`.
     *
     * @example
     *  import { actorCalled, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  interface PersonalDetails {
     *      name?: string;
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(
     *              Notepad.with<PersonalDetails>({
     *                  name: 'Leonard Shelby',
     *              })
     *          )
     *      )
     *      .attemptsTo(
     *          Ensure.that(
     *              Note.of<PersonalDetails>('name'),
     *              equals('Leonard Shelby')
     *          ),
     *      );
     *
     * @param {keyof Notes} subject
     *  A subject (name) that uniquely identifies a given note
     *
     * @returns {QuestionAdapter<Notes[typeof subject]>}
     */
    static of<Notes extends Record<string, any>>(
        subject: keyof Notes
    ): QuestionAdapter<Notes[typeof subject]> {
        return Question.about<Promise<Notes[typeof subject]>>(subject as string, actor => {
            return TakeNotes.as<Notes>(actor).read(subject as string);
        });
    }

    /**
     * @desc
     *  Records a note to be identified by `subject`.
     *
     *  The {@link Answerable} value will be
     *  resolved by {@link Actor#answer} when the note is recorded
     *
     * @example
     *  import { actorCalled, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *
     *  interface PersonalDetails {
     *      name?: string;
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(Notepad.empty<PersonalDetails>())
     *      )
     *      .attemptsTo(
     *          Note.record<PersonalDetails>('name', actorInTheSpotlight().name),
     *          Ensure.that(
     *              Note.of<PersonalDetails>('name'),
     *              equals('Leonard')
     *          ),
     *      );
     *
     * @param {keyof Notes} subject
     *  A subject (name) that uniquely identifies a given note
     *
     * @param {Answerable<Notes[typeof subject]>} value
     *  The value to record
     *
     * @returns {Interaction}
     */
    static record<Notes extends Record<string, any>>(
        subject: keyof Notes,
        value: Answerable<Notes[typeof subject]>,
    ): Interaction {
        return Interaction.where(`#actor makes note of ${ subject }`, async actor => {
            const answer = await actor.answer(value);
            TakeNotes.as<Notes>(actor).write(subject as string, answer);
        });
    }

    /**
     * @desc
     *  Removes a note identified by `subject`.
     *
     * @example
     *  import { actorCalled, TakeNotes } from '@serenity-js/core';
     *  import { Ensure, isPresent, not } from '@serenity-js/assertions';
     *
     *  interface PersonalDetails {
     *      name?: string;
     *  }
     *
     *  actorCalled('Leonard')
     *      .whoCan(
     *          TakeNotes.using(
     *              Notepad.with<PersonalDetails>({
     *                  name: 'Leonard Shelby',
     *              })
     *          )
     *      )
     *      .attemptsTo(
     *          Ensure.that(Note.of<PersonalDetails>('name'), isPresent()),
     *
     *          Note.remove<PersonalDetails>('name'),
     *
     *          Ensure.that(Note.of<PersonalDetails>('name'), not(isPresent())),
     *      );
     *
     * @param {keyof Notes} subject
     *  A subject (name) that uniquely identifies a given note
     *
     * @returns {Interaction}
     */
    static remove<Notes extends Record<string, any>>(
        subject: keyof Notes
    ): Interaction {
        return Interaction.where(`#actor removes note of ${ subject }`, async actor => {
            TakeNotes.as<Notes>(actor).remove(subject as string);
        });
    }
}
