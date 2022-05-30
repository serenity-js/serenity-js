import 'mocha';

import { actorCalled, engage, Note, Notepad } from '../../../src';
import { expect } from '../../expect';
import { Ensure } from '../Ensure';
import { Actors } from './Actors';
import { ExampleNotes } from './ExampleNotes';

/** @test {Notepad} */
describe('Notepad', () => {

    beforeEach(() =>
        engage(new Actors())
    );

    afterEach(() =>
        actorCalled('Leonard')
            .attemptsTo(
                Notepad.clear(),
            ));

    describe('.empty()', () => {

        /** @test {Notepad.empty} */
        it('instantiates a new empty notepad', () => {

            const notepad = Notepad.empty();

            expect(notepad.size()).equals(0);
        });
    });

    describe('.with(notes)', () => {

        /** @test {Notepad.with} */
        it('instantiates a new notepad with an initial state', () => {

            const notepad = Notepad.with({
                'my_note': 'value'
            });

            expect(notepad.size()).equals(1);
            expect(notepad.read('my_note')).equals('value');
        });
    });

    describe('.import(notes)', () => {

        /** @test {Notepad.import} */
        it(`adds notes to Actor's notepad`, () =>
            actorCalled('Leonard')
                .attemptsTo(
                    Ensure.same(Note.of<ExampleNotes>('example_note').isPresent(), false),
                    Ensure.same(Note.of<ExampleNotes>('another_example_note').isPresent(), false),

                    Notepad.import<ExampleNotes>({
                        example_note: 'first',
                        another_example_note: 'second',
                    }),

                    Ensure.same(Note.of<ExampleNotes>('example_note'), 'first'),
                    Ensure.same(Note.of<ExampleNotes>('another_example_note'), 'second'),
                ));

        /** @test {Notepad.import} */
        it(`overwrites any existing notes`, () =>
            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', 'first original'),
                    Note.record<ExampleNotes>('another_example_note', 'second original'),

                    Notepad.import<ExampleNotes>({
                        example_note: 'overwritten',
                    }),

                    Ensure.same(Note.of<ExampleNotes>('example_note'), 'overwritten'),
                    Ensure.same(Note.of<ExampleNotes>('another_example_note'), 'second original'),
                ));
    });

    describe('.clear()', () => {

        /** @test {Notepad.clear} */
        it('removes all the notes', () =>
            actorCalled('Leonard')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', 'first'),
                    Ensure.same(Note.of<ExampleNotes>('example_note').isPresent(), true),

                    Note.record<ExampleNotes>('another_example_note', 'second'),
                    Ensure.same(Note.of<ExampleNotes>('another_example_note').isPresent(), true),

                    Notepad.clear(),
                    Ensure.same(Note.of<ExampleNotes>('example_note').isPresent(), false),
                    Ensure.same(Note.of<ExampleNotes>('another_example_note').isPresent(), false),
                ));
    });

    describe('shared by multiple actors', () => {

        it('allows the actors to share notes, as long as they use the same notepad object', async () => {

            // "actors with shared notepad" are defined in ./Actors.ts
            await actorCalled('Alice with shared notepad')
                .attemptsTo(
                    Ensure.same(Note.of<ExampleNotes>('example_note').isPresent(), false),
                );

            await actorCalled('Bob with shared notepad')
                .attemptsTo(
                    Note.record<ExampleNotes>('example_note', 'shared note'),
                    Ensure.same(Note.of<ExampleNotes>('example_note').isPresent(), true),
                );

            await actorCalled('Alice with shared notepad')
                .attemptsTo(
                    Ensure.same(Note.of<ExampleNotes>('example_note').isPresent(), true),
                    Ensure.same(Note.of<ExampleNotes>('example_note'), 'shared note'),
                );
        });
    });
});
