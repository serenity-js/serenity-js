import 'mocha';

import { actorCalled, engage, LogicError, serenity } from '../../../src';
import { SceneFinished, SceneFinishes, SceneStarts } from '../../../src/events';
import { FileSystemLocation, Path } from '../../../src/io';
import { Category, CorrelationId, ExecutionSuccessful, Name, ScenarioDetails } from '../../../src/model';
import { Actor, Note, Question, TakeNote, TakeNotes } from '../../../src/screenplay';
import { Cast } from '../../../src/stage';
import { expect } from '../../expect';
import { EnsureSame } from '../EnsureSame';

/** @test {TakeNotes} */
describe('TakeNotes', () => {

    class Actors implements Cast {
        prepare(actor: Actor): Actor {
            switch (actor.name) {
                case 'Alice':
                case 'Bob':
                    return actor.whoCan(
                        TakeNotes.usingASharedNotepad(),
                    );
                case 'Emma':
                case 'Wendy':
                default:
                    return actor.whoCan(
                        TakeNotes.usingAnEmptyNotepad()
                    );
            }
        }
    }

    const drinks = {
        'Alice': 'Apple Juice',
        'Bob': 'Beer',
        'Emma': 'Earl Grey tea',
        'Wendy': 'Water',
    }

    const AFavouriteDrink = () =>
        Question.about<string>(`a favourite drink`, (actor: Actor) => drinks[actor.name]);

    const sceneId = new CorrelationId(`some scene id`); // the actual value doesn't matter since discarding abilities is not scene id-dependent

    before(() => engage(new Actors()));

    /** @test {TakeNotes.usingAnEmptyNotepad} */
    describe('usingAnEmptyNotepad', () => {

        beforeEach(async () => {
            serenity.announce(new SceneStarts(sceneId, scenarioDetails));
        });

        afterEach(async () => {
            serenity.announce(new SceneFinishes(sceneId, scenarioDetails));
            serenity.announce(new SceneFinished(sceneId, scenarioDetails, new ExecutionSuccessful()));
        });

        /**
         * @test {TakeNotes.usingAnEmptyNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it('enables the actor to take note of an answer to a given question and recall it later', () =>
            actorCalled('Emma').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Emma),
            ));

        /**
         * @test {TakeNotes.usingAnEmptyNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it('enables the actor to take note of an answer to a given question under a custom name', () =>
            actorCalled('Emma').attemptsTo(
                TakeNote.of(AFavouriteDrink()).as('favourite drink'),
                EnsureSame(Note.of<string>('favourite drink'), drinks.Emma),
            ));

        /**
         * @test {TakeNotes.usingAnEmptyNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it(`ensures that actors have their own notepads and don't share notes`, async () => {
            await actorCalled('Emma').attemptsTo(
                TakeNote.of(AFavouriteDrink())
            );

            await actorCalled('Wendy').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
            );

            await actorCalled('Emma').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Emma),
            );

            await actorCalled('Wendy').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Wendy),
            );
        });

        /**
         * @test {TakeNotes.usingAnEmptyNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it(`ensures the notepad is cleared between test scenarios`, async () => {

            await actorCalled('Emma').attemptsTo(
                TakeNote.of(AFavouriteDrink())
            );

            serenity.announce(new SceneFinishes(sceneId, scenarioDetails))
            serenity.announce(new SceneFinished(sceneId, scenarioDetails, new ExecutionSuccessful()))

            await serenity.waitForNextCue()

            serenity.announce(new SceneStarts(sceneId, scenarioDetails))

            return expect(actorCalled('Emma').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
            )).to.be.rejectedWith(LogicError, `The answer to "a favourite drink" has never been recorded`);
        });
    });

    /** @test {TakeNotes.usingASharedNotepad} */
    describe('usingASharedNotepad', () => {

        /**
         * @test {TakeNotes.usingASharedNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it('enables the actor to take note of an answer to a given question and recall it later', () =>
            actorCalled('Alice').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
            ));

        /**
         * @test {TakeNotes.usingASharedNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it(`ensures that actors can share their notes`, async () => {
            await actorCalled('Alice').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
            );

            await actorCalled('Bob').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
            );
        });

        /**
         * @test {TakeNotes.usingASharedNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it(`ensures the notepad is shared between test scenarios`, async () => {
            await actorCalled('Alice').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
            )

            serenity.announce(new SceneFinishes(sceneId, scenarioDetails))
            serenity.announce(new SceneFinished(sceneId, scenarioDetails, new ExecutionSuccessful()))
            await serenity.waitForNextCue()

            serenity.announce(new SceneStarts(sceneId, scenarioDetails))

            return expect(actorCalled('Alice').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
            )).to.be.fulfilled;
        });
    });

    const scenarioDetails = new ScenarioDetails(
        new Name('ensures the notepad is cleared between test scenarios'),
        new Category('TakeNotes'),
        new FileSystemLocation(new Path('TakeNotes.spec.ts'))
    );
});
