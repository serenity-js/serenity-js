import * as sinon from 'sinon';
import { ActivityDetails, Name } from '../../../src/model';
import { Activity, Actor, Note, Question, TakeNote, TakeNotes } from '../../../src/screenplay';
import { Stage } from '../../../src/stage';
import { EnsureSame } from '../EnsureSame';

describe('TakeNote', () => {

    const
        expectedHobby = 'DYI',
        NameOfAHobby = () => Question.about(`the name of a hobby`, someActor => Promise.resolve(expectedHobby));

    let stage: sinon.SinonStubbedInstance<Stage>,
        Noah: Actor;

    beforeEach(() => {
        stage = sinon.createStubInstance(Stage);
        // activityDetailsFor is a bit more involved than that, but this is a good approximation
        stage.activityDetailsFor.callsFake((activity: Activity) => new ActivityDetails(new Name(activity.toString())));

        Noah = new Actor('Noah', stage as unknown as Stage).whoCan(TakeNotes.usingAnEmptyNotepad());
    });

    /**
     * @test {TakeNotes}
     * @test {TakeNote}
     */
    it('enables the Actor to remember an answer to a Question', () => Noah.attemptsTo(
        TakeNote.of(NameOfAHobby()),
        EnsureSame(Note.of(NameOfAHobby()), expectedHobby),
    ));
});
