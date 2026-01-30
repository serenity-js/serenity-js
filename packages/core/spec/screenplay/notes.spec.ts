import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { type Ability, type Actor, Question } from '../../src';
import { Cast, LogicError, Notepad, notes, Serenity, TakeNotes } from '../../src';
import { trimmed } from '../../src/io';
import { expect } from '../expect';
import { Ensure } from './Ensure';

describe('Notepad', () => {

    afterEach(() => dismissAnyActiveActors());

    it('correctly detects its invocation location', () => {
        const activity = notes()
            .set('firstNote', 'value');
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('notes.spec.ts');
        expect(location.line).to.equal(16);
        expect(location.column).to.equal(14);
    });

    describe('when producing a description', () => {

        describe('toString()', () => {

            it('provides a human-friendly description of the NotepadAdapter', async () => {
                expect(notes().toString()).to.equal('notes');
            });

            it('provides a human-friendly description of NotepadAdapter.get', async () => {
                expect(notes().get('myNote').toString()).to.equal('a note of myNote');
            });

            it('provides a human-friendly description of NotepadAdapter.set', async () => {
                expect(notes().set('myNote', 'value').toString()).to.equal('#actor takes notes: myNote');
            });

            it('provides a human-friendly description of chained NotepadAdapter.set', async () => {
                expect(
                    notes()
                        .set('firstNote', 'value')
                        .set('secondNote', 'value')
                        .set('thirdNote', 'value')
                        .toString()
                ).to.equal('#actor takes notes: firstNote, secondNote, thirdNote');
            });

            it('provides a human-friendly description of NotepadAdapter.has', async () => {
                expect(notes().has('myNote').toString()).to.equal('a note of myNote exists');
            });

            it('provides a human-friendly description of NotepadAdapter.delete', async () => {
                expect(notes().delete('myNote').toString()).to.equal('#actor deletes a note of myNote');
            });

            it('provides a human-friendly description of NotepadAdapter.clear', async () => {
                expect(notes().clear().toString()).to.equal('#actor clears notes from their notepad');
            });

            it('provides a human-friendly description of NotepadAdapter.size', async () => {
                expect(notes().size().toString()).to.equal('notes');
            });

            it('provides a human-friendly description of NotepadAdapter.toJSON', async () => {
                expect(notes().toJSON().toString()).to.equal('notepad serialised to JSON');
            });
        });

        describe('describedBy(actor)', () => {

            interface MyNotes {
                myNote: string;
            }

            const myNote = 'example note value';

            let Leonard: Actor;

            beforeEach(() => {
                Leonard = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.with<MyNotes>({ myNote })))[0];
            });

            it('provides a human-friendly description of NotepadAdapter.get', async () => {

                const statement = notes<MyNotes>().get('myNote');

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('"example note value"');
                expect(toString).to.equal('a note of myNote');
            });

            it('allows for overriding the description', async () => {

                const statement = notes<MyNotes>().get('myNote').describedAs(Question.formattedValue({ maxLength: 10 }));

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('"example..."');
                expect(toString).to.equal('a note of myNote');
            });

            it('provides a human-friendly description of NotepadAdapter.set', async () => {
                const statement = notes<MyNotes>().set('myNote', 'example note value');

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal(trimmed`
                    | Leonard takes notes:
                    | - myNote: "example note value"
                `);
                expect(toString).to.equal('#actor takes notes: myNote');
            });

            it('provides a human-friendly description of chained NotepadAdapter.set', async () => {
                const statement = notes()
                    .set('firstNote', { first: 'value' })
                    .set('secondNote', [ 1, 2 ])
                    .set('thirdNote', 'third');

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal(trimmed`
                    | Leonard takes notes:
                    | - firstNote:  { first: "value" }
                    | - secondNote: [ 1, 2 ]
                    | - thirdNote:  "third"
                `);
                expect(toString).to.equal('#actor takes notes: firstNote, secondNote, thirdNote');
            });

            it('provides a human-friendly description of NotepadAdapter.has', async () => {
                const statement = notes().has('myNote');

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('a note of myNote exists');
                expect(toString).to.equal('a note of myNote exists');
            });

            it('provides a human-friendly description of NotepadAdapter.delete', async () => {
                const statement = notes().delete('myNote');

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('Leonard deletes a note of myNote');
                expect(toString).to.equal('#actor deletes a note of myNote');
            });

            it('provides a human-friendly description of NotepadAdapter.clear', async () => {
                const statement = notes().clear();

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('Leonard clears 1 note from their notepad');
                expect(toString).to.equal('#actor clears notes from their notepad');
            });

            it('provides a human-friendly description of NotepadAdapter.size', async () => {
                const statement = notes().size();

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('1 note');
                expect(toString).to.equal('notes');
            });

            it('provides a human-friendly description of NotepadAdapter.toJSON', async () => {
                const statement = notes().toJSON();

                const description   = await statement.describedBy(Leonard);
                const toString      = statement.toString();

                expect(description).to.equal('notepad serialised to JSON');
                expect(toString).to.equal('notepad serialised to JSON');
            });

            describe('when used with nested QuestionAdapters', () => {

                it('provides a human-friendly description of a field', async () => {

                    const statement = notes<MyNotes>().get('myNote').length.describedAs(Question.formattedValue());

                    const description   = await statement.describedBy(Leonard);
                    const answer        = await statement.answeredBy(Leonard);
                    const toString      = statement.toString();

                    expect(description).to.equal(String(myNote.length));
                    expect(answer).to.equal(myNote.length);
                    expect(toString).to.equal('<<a note of myNote>>.length');
                });
            });
        });
    });

    describe('when recording notes', () => {

        it('allows the actor to record a note to be recalled later', async () => {

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.usingAnEmptyNotepad());

            const name = `note's name`;
            const content = 'some example content';

            await actor.attemptsTo(
                notes().set(name, content),
                Ensure.equal(notes().get(name), content)
            );
        });

        it('allows the actor to record several notes at the same time', async () => {

            interface MyNotes {
                firstNote: string;
                secondNote: number;
            }

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.usingAnEmptyNotepad());

            await actor.attemptsTo(
                notes<MyNotes>()
                    .set('firstNote', 'example')
                    .set('secondNote', Promise.resolve(42))
                    .set('firstNote', 'another example'),

                Ensure.equal(notes().toJSON(), {
                    firstNote: 'another example',
                    secondNote: 42,
                })
            );
        });

        it('complains when the note to be retrieved has not been set', async () => {

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(Notepad.empty()));

            await expect(
                actor.attemptsTo(
                    Ensure.equal(notes().get('myNote'), 'some unset value'),
                )
            ).to.be.rejectedWith(LogicError, `Note of 'myNote' cannot be retrieved because it's never been recorded`)
        });

        describe('enables the actor to check for the presence of information that', () => {

            given([
                { description: 'string',    value: 'example'    },
                { description: 'number',    value: 0            },
                { description: 'boolean',   value: false        },
                { description: 'BigInt',    value: BigInt('0')  },
            ]).
            it('is represented using primitive data types', async ({ value }) => {

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.empty()));

                const name = 'myNote';

                await actor.attemptsTo(
                    Ensure.equal(notes().get(name).isPresent(), false),
                    Ensure.equal(notes().has(name), false),

                    notes().set(name, value),

                    Ensure.equal(notes().get(name).isPresent(), true),
                    Ensure.equal(notes().has(name), true),

                    Ensure.same(notes().get(name), value),
                );
            });

            it('is represented using plain JavaScript objects', async () => {

                const noteName = 'myNote';
                const exampleObject = { key0: { key1: 'value' } };

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.empty()));

                await actor.attemptsTo(
                    Ensure.equal(notes().get(noteName).isPresent(), false),
                    Ensure.equal(notes().get(noteName).key0.isPresent(), false),
                    Ensure.equal(notes().get(noteName).key0.key1.isPresent(), false),

                    notes().set(noteName, exampleObject),

                    Ensure.equal(notes().get(noteName).isPresent(), true),
                    Ensure.equal(notes().get(noteName).key0.isPresent(), true),
                    Ensure.equal(notes().get(noteName).key0.key1.isPresent(), true),

                    Ensure.same(notes().get(noteName), exampleObject),
                );
            });
        });

        describe('provides QuestionAdapters to make it easier to interact with notes recorded in a notepad that', () => {

            it('is untyped', async () => {

                const expectedValue = 'hello!';

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.empty()));

                await actor.attemptsTo(
                    Ensure.equal(notes().get('key0').isPresent(), false),
                    Ensure.equal(notes().get('key0').key1.isPresent(), false),
                    Ensure.equal(notes().get('key0').key1.key2.isPresent(), false),

                    notes().set('key0', {
                        key1: { key2: expectedValue }
                    }),

                    Ensure.equal(notes().get('key0').isPresent(), true),
                    Ensure.equal(notes().get('key0').key1.isPresent(), true),
                    Ensure.equal(notes().get('key0').key1.key2.isPresent(), true),

                    Ensure.equal(notes().get('key0').key1.key2.toLocaleUpperCase(), 'HELLO!'),
                    Ensure.equal(notes().get('key0').key1.key2[0], 'h'),
                );
            });

            it('is typed', async () => {

                interface ExampleNotes {
                    key0: {
                        key1: {
                            key2: string
                        }
                    };
                }

                const expectedValue = 'hello!';

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.empty<ExampleNotes>()));

                await actor.attemptsTo(
                    Ensure.equal(notes<ExampleNotes>().get('key0').isPresent(), false),
                    Ensure.equal(notes<ExampleNotes>().get('key0').key1.isPresent(), false),
                    Ensure.equal(notes<ExampleNotes>().get('key0').key1.key2.isPresent(), false),

                    notes<ExampleNotes>().set('key0', {
                        key1: { key2: expectedValue }
                    }),

                    Ensure.equal(notes<ExampleNotes>().get('key0').isPresent(), true),
                    Ensure.equal(notes<ExampleNotes>().get('key0').key1.isPresent(), true),
                    Ensure.equal(notes<ExampleNotes>().get('key0').key1.key2.isPresent(), true),

                    Ensure.equal(notes<ExampleNotes>().get('key0').key1.key2.toLocaleUpperCase(), 'HELLO!'),
                    Ensure.equal(notes<ExampleNotes>().get('key0').key1.key2[0], 'h'),
                );
            });
        });
    });

    describe('when removing notes individually', () => {

        it('allows the actor to remove one note at a time', async () => {

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(Notepad.with({
                    key0: 'value0',
                    key1: 'value1',
                })));

            await actor.attemptsTo(
                notes().delete('key0'),
                Ensure.equal(notes().get('key0').isPresent(), false),
                Ensure.equal(notes().get('key1').isPresent(), true),
                Ensure.equal(notes().toJSON(), { key1: 'value1' }),
            );
        });

        it('returns true if the note to be deleted existed before and has been deleted successfully', async () => {
            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(Notepad.with({ key: 'value' })));

            await actor.attemptsTo(
                Ensure.equal(notes().delete('key'), true),
            );
        });

        it('returns false if the note to be deleted did not exist in the first place', async () => {
            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(Notepad.empty()));

            await actor.attemptsTo(
                Ensure.equal(notes().delete('key'), false),
            );
        });
    });

    describe('when clearing the notepad', () => {

        it('removes all the notes', async () => {
            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(Notepad.with({
                    key0: 'value0',
                    key1: { key10: 'value10' },
                })));

            await actor.attemptsTo(
                notes().clear(),
                Ensure.equal(notes().toJSON(), {}),
            );
        })
    });

    describe('when checking the size of the notepad', () => {

        it('allows the actor to check the number of recorded notes', async () => {

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.usingAnEmptyNotepad());

            const name = `note's name`;
            const content = 'some example content';

            await actor.attemptsTo(
                Ensure.equal(notes().size(), 0),

                notes().set(name, content),
                Ensure.equal(notes().size(), 1),

                notes().delete(name),
                Ensure.equal(notes().size(), 0),
            )
        });
    });

    describe('when serialising', () => {

        describe('toJSON', () => {

            it('serialises primitive data types', async () => {
                const data = {
                    string: 'example',
                    number: 1,
                    boolean: true,
                    null: null,
                    object: { key0: { key1: 'value' }},
                    array: [ 'apples', 'bananas', 'cucumbers' ],
                };

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.with(data)));

                await actor.attemptsTo(
                    Ensure.equal(notes().toJSON(), data),
                );
            });

            it('serialises ES Map to plain object', async () => {
                const data = {
                    map: new Map(Object.entries({ key: 'value' })),
                };

                const expectedJson = {
                    map: { key: 'value' },
                };

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.with(data)));

                await actor.attemptsTo(
                    Ensure.equal(notes().toJSON(), expectedJson),
                );
            });

            it('serialises ES Set to Array', async () => {
                const data = {
                    set: new Set([ 'first', 'second', 'third' ]),
                };

                const expectedJson = {
                    set: [ 'first', 'second', 'third' ],
                };

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.with(data)));

                await actor.attemptsTo(
                    Ensure.equal(notes().toJSON(), expectedJson),
                );
            });

            it('serialises types that provide a custom toJSON method', async () => {
                class Person {
                    constructor(private readonly name: string, private readonly age: number) {
                    }
                    toJSON() {
                        return {
                            type: 'Person',
                            data: {
                                name: this.name,
                                age: this.age,
                            }
                        }
                    }
                }

                const [ actor ] = actors('Leonard')
                    .whoCan(TakeNotes.using(Notepad.with({
                        people: [
                            new Person('Alice', 27),
                            new Person('Bob', 32),
                        ]
                    })));

                await actor.attemptsTo(
                    Ensure.equal(notes().toJSON(), {
                        people: [
                            { type: 'Person', data: { name: 'Alice', age: 27 } },
                            { type: 'Person', data: { name: 'Bob', age: 32 } },
                        ]
                    }),
                );
            });
        });
    });

    describe('when mutating the recorded notes', () => {

        it('allows to add items to an Array', async () => {
            interface Notes {
                items: string[];
            }

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(Notepad.with<Notes>({ items: [] })));

            await actor.attemptsTo(
                notes<Notes>().get('items').push('bananas'),
                notes<Notes>().get('items').push('apples'),
                notes<Notes>().get('items').push('cucumbers'),
                notes<Notes>().get('items').sort(),

                Ensure.equal(notes<Notes>().get('items'), [
                    'apples',
                    'bananas',
                    'cucumbers',
                ]),
            );
        });

        it('allows to set values in a Map', async () => {
            interface Notes {
                items: Map<string, number>;
            }

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(
                    Notepad.with<Notes>({ items: new Map<string, number>() }))
                );

            await actor.attemptsTo(
                notes<Notes>().get('items').set('item1', 1),
                notes<Notes>().get('items').set('item3', 3),
                notes<Notes>().get('items').set('item2', 2),

                Ensure.equal(
                    notes<Notes>().get('items').keys().as(Array.from).sort(),
                    [
                        'item1',
                        'item2',
                        'item3',
                    ]
                ),
            );
        });

        it('allows to add items to a Set', async () => {

            interface Notes {
                items: Set<string>;
            }

            const [ actor ] = actors('Leonard')
                .whoCan(TakeNotes.using(
                    Notepad.with<Notes>({ items: new Set<string>() }))
                );

            await actor.attemptsTo(
                notes<Notes>().get('items').add('bananas'),
                notes<Notes>().get('items').add('apples'),

                notes<Notes>().get('items').add('bananas'),
                notes<Notes>().get('items').add('apples'),

                notes<Notes>().get('items').add('cucumbers'),

                Ensure.equal(
                    notes<Notes>().get('items').values().as(Array.from).sort(),
                    [
                        'apples',
                        'bananas',
                        'cucumbers',
                    ]
                ),
            );
        });
    });

    describe('when sharing notes across multiple actors', () => {

        it('allows the actors to share notes', async () => {
            interface Notes {
                apiKey?: string;
            }

            const [ alice, bob ] = actors('Alice', 'Bob')
                .whoCan(TakeNotes.using(
                    Notepad.with<Notes>({ }))
                );

            await alice.attemptsTo(
                Ensure.equal(notes<Notes>().get('apiKey').isPresent(), false),

                notes<Notes>().set('apiKey', 'example-key'),
            );

            await bob.attemptsTo(
                Ensure.equal(notes<Notes>().get('apiKey').isPresent(), true),
                Ensure.equal(notes<Notes>().get('apiKey'), 'example-key'),
            )
        });
    });
});

let activeActors: Actor[] = [];

function actors(...names: string[]) {
    return {
        whoCan: (...abilities: Ability[])  => {
            const serenity = new Serenity();

            serenity.configure({
                crew: [],
                actors: Cast.where(actor => actor.whoCan(...abilities)),
            });

            names.forEach(name =>
                activeActors.push(serenity.theActorCalled(name))
            );

            return activeActors;
        }
    }
}

async function dismissAnyActiveActors(): Promise<void> {
    for(const actor of activeActors) {
        await actor.dismiss();

    }

    activeActors = [];
}
