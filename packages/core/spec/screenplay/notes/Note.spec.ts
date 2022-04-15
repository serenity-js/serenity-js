import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled, Answerable, engage, Log, LogicError, Note, Notepad, Question } from '../../../src';
import { expect } from '../../expect';
import { EnsureSame } from '../EnsureSame';
import { Actors } from './Actors';
import { ExampleNotes } from './ExampleNotes';

const p = <T>(value: T) =>
    Promise.resolve(value);

const q = <T>(subject: string, value: T) =>
    Question.about(subject, actor => value);

/** @test {Note} */
describe('Note', () => {

    const expectedValue = 'expected value';

    beforeEach(() =>
        engage(new Actors())
    );

    afterEach(() =>
        actorCalled('Leonard')
            .attemptsTo(
                Notepad.clear(),
            ));

    describe('.of(subject)', () => {

        /** @test {Note.of} */
        it(`enables the actor to recall a note they've made earlier`, () =>

            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', expectedValue),
                    EnsureSame(Note.of<ExampleNotes>('example_note'), expectedValue),
                ));

        /** @test {Note.of} */
        it('allows to check if a given note is present', () =>
            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', expectedValue),
                    EnsureSame(Note.of<ExampleNotes>('example_note').isPresent(), true),
                ));

        /** @test {Note.of} */
        it('allows to ensure that a given note is not present', () =>
            actorCalled('Leonard')
                .attemptsTo(
                    EnsureSame(Note.of<ExampleNotes>('example_note').isPresent(), false),
                ));

        /** @test {Note.of} */
        it('complains if a note to be retrieved has not been recorded', () =>
            expect(actorCalled('Leonard')
                .attemptsTo(
                    EnsureSame(Note.of<ExampleNotes>('example_note').isPresent(), false),
                    Log.the(Note.of<ExampleNotes>('example_note')),
                )).to.be.rejectedWith(LogicError, `Note of 'example_note' cannot be retrieved because it's never been recorded`)
        );

        /** @test {Note.of} */
        it('returns a QuestionAdapter', () =>
            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', 'abc'),
                    EnsureSame(Note.of<ExampleNotes>('example_note').charAt(1), 'b'),
                ));
    });

    describe('.record(subject, value)', () => {

        given([
            { description: 'T',                    value: expectedValue         },
            { description: 'Promise<T>',           value: p(expectedValue)      },
            { description: 'Question<Promise<T>>', value: q('example subject', p(expectedValue))   },
            { description: 'Question<T>',          value: q('example subject', expectedValue)      },
        ]).
        it('automatically resolves any answerable when the note is recorded ', ({ value }: { value: Answerable<string> }) =>

            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', value),
                    EnsureSame(Note.of<ExampleNotes>('example_note'), expectedValue),
                ));
    });

    describe('.remove(subject)', () => {

        /** @test {Note.remove} */
        it('removes a specific note', () =>
            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', 'first'),
                    EnsureSame(Note.of<ExampleNotes>('example_note').isPresent(), true),

                    Note.record<ExampleNotes>('another_example_note', 'second'),
                    EnsureSame(Note.of<ExampleNotes>('another_example_note').isPresent(), true),

                    Note.remove<ExampleNotes>('example_note'),
                    EnsureSame(Note.of<ExampleNotes>('example_note').isPresent(), false),
                    EnsureSame(Note.of<ExampleNotes>('another_example_note').isPresent(), true),
                ));
    });
});
