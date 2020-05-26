import 'mocha';

import { actorCalled, engage, LogicError, serenity } from '../../../src';
import { SceneFinishes } from '../../../src/events';
import { FileSystemLocation, Path } from '../../../src/io';
import { Category, Name, ScenarioDetails } from '../../../src/model';
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
        Question.about(`a favourite drink`, (actor: Actor) => drinks[actor.name]);

    beforeEach(() => engage(new Actors()));

    /** @test {TakeNotes.usingAnEmptyNotepad} */
    describe('usingAnEmptyNotepad', () => {

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
        it(`ensures that actors have their own notepads and don't share notes`, () =>
            actorCalled('Emma').attemptsTo(
                TakeNote.of(AFavouriteDrink())
            ).
            then(() => actorCalled('Wendy').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
            )).
            then(() => actorCalled('Emma').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Emma),
            )).
            then(() => actorCalled('Wendy').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Wendy),
            )));

        /**
         * @test {TakeNotes.usingAnEmptyNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it(`ensures the notepad is cleared between test scenarios`, () =>
            actorCalled('Emma').attemptsTo(
                TakeNote.of(AFavouriteDrink())
            ).
            then(() => {
                serenity.announce(new SceneFinishes(scenarioDetails))
            }).
            then(() => serenity.waitForNextCue()).
            then(() =>
                expect(actorCalled('Emma').attemptsTo(
                    EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
                )).to.be.rejectedWith(LogicError, `The answer to "a favourite drink" has never been recorded`),
            ),
        );
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
        it(`ensures that actors can share their notes`, () =>
            actorCalled('Alice').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
            ).
            then(() => actorCalled('Bob').attemptsTo(
                EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
            ))
        );

        /**
         * @test {TakeNotes.usingASharedNotepad}
         * @test {Note}
         * @test {TakeNote}
         */
        it(`ensures the notepad is cleared between test scenarios`, () =>
            actorCalled('Alice').attemptsTo(
                TakeNote.of(AFavouriteDrink()),
            ).
            then(() => {
                serenity.announce(new SceneFinishes(scenarioDetails))
            }).
            then(() => serenity.waitForNextCue()).
            then(() =>
                expect(actorCalled('Alice').attemptsTo(
                    EnsureSame(Note.of(AFavouriteDrink()), drinks.Alice),
                )).to.be.rejectedWith(LogicError, `The answer to "a favourite drink" has never been recorded`),
            ),
        );
    });

    const scenarioDetails = new ScenarioDetails(
        new Name('ensures the notepad is cleared between test scenarios'),
        new Category('TakeNotes'),
        new FileSystemLocation(new Path('TakeNotes.spec.ts'))
    );
});
