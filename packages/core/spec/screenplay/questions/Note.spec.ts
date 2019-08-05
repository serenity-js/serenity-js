import * as sinon from 'sinon';
import { LogicError } from '../../../src/errors';
import { Ability, Actor, Log, Note, Question, TakeNotes } from '../../../src/screenplay';
import { Stage } from '../../../src/stage';
import { expect } from '../../expect';
import { EnsureSame } from '../EnsureSame';

describe('Note', () => {
    const
        expectedHobby = 'DYI',
        NameOfAHobby = () => Question.about(`the name of a hobby`, someActor => Promise.resolve(expectedHobby));

    let stage: sinon.SinonStubbedInstance<Stage>,
        Noah: Actor;

    beforeEach(() => {
        stage = sinon.createStubInstance(Stage);

        Noah = new Actor('Noah', stage as unknown as Stage)
            .whoCan(TakeNotes.usingAnEmptyNotepad());
    });

    /**
     * @test {TakeNotes}
     * @test {Note}
     */
    it('enables the actor to recall the answer to a given question', () =>
        expect(actorWhoCan(new TakeNotes({ [NameOfAHobby().toString()]: 'DYI' })).attemptsTo(
            EnsureSame(Note.of(NameOfAHobby()), 'DYI'),
        )));

    /**
     * @test {TakeNotes}
     * @test {Note}
     */
    it('complains if no answer to a given question has ever been remembered', () =>
        expect(actorWhoCan(TakeNotes.usingAnEmptyNotepad()).attemptsTo(
            Log.the(Note.of(NameOfAHobby())),
        )).to.be.rejectedWith(LogicError, 'The answer to "the name of a hobby" has never been recorded'));

    function actorWhoCan(...abilities: Ability[]): Actor {
        return new Actor('Noah', stage as unknown as Stage)
            .whoCan(...abilities);
    }
});
