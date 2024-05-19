/* eslint-disable unicorn/consistent-function-scoping */
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { ImplementationPendingError } from '../../src/errors';
import { CorrelationId } from '../../src/model';
import { Actor, Interaction, Question, Task, the } from '../../src/screenplay';
import { Stage } from '../../src/stage';
import { expect } from '../expect';

describe('Task', () => {

    let stage: sinon.SinonStubbedInstance<Stage>;

    beforeEach(() => {
        stage = sinon.createStubInstance(Stage);

        const
            sceneId = new CorrelationId('some-scene-id'),
            activityId = new CorrelationId('some-activity-id');

        stage.currentSceneId.returns(sceneId);
        stage.assignNewActivityId.returns(activityId);
        stage.currentActivityId.returns(activityId);
    });

    const
        Nock    = () => Interaction.where(`#actor places an arrow on the bow`, actor => void 0),
        Draw    = () => Interaction.where(`#actor pulls back the bow string`, actor => void 0),
        Loose   = () => Interaction.where(`#actor releases an arrow from the bow`, actor => void 0);

    const ShootAnArrow = () => Task.where(`#actor shoots an arrow`,
        Nock(),
        Draw(),
        Loose(),
    );

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location when configured with no activities', () => {
            const activity = () => Task.where(`#actor climbs a mountain`);
            const location = activity().instantiationLocation();

            expect(location.path.basename()).to.equal('Task.spec.ts');
            expect(location.line).to.equal(41);
            expect(location.column).to.equal(30);
        });

        it('correctly detects its invocation location when configured with custom activities', () => {
            const location = ShootAnArrow().instantiationLocation();

            expect(location.path.basename()).to.equal('Task.spec.ts');
            expect(location.line).to.equal(49);
            expect(location.column).to.equal(30);
        });
    });

    it('provides a convenient factory method for defining tasks', () => {

        const Lara = new Actor('Lara', stage as unknown as Stage);

        return expect(Lara.attemptsTo(ShootAnArrow())).to.be.fulfilled;
    });

    it('provides a way to describe a collection of activities', () => {
        expect(ShootAnArrow().toString()).to.equal(`#actor shoots an arrow`);
    });

    it('allows for the description to be resolved at runtime', async () => {

        const Lara = new Actor('Lara', stage as unknown as Stage);
        const item = Question.about('item', actor => 'arrow');

        const task = Task.where(the`#actor shoots an ${ item }`, Nock(), Draw(), Loose());

        expect(await task.describedBy(Lara)).to.equal(`#actor shoots an "arrow"`);
        expect(task.toString()).to.equal(`#actor shoots an item`);
    });

    it('generates a pending task if no activities are provided', () => {

        const Lara = new Actor('Lara', stage as unknown as Stage);

        const ClimbAMountain = () => Task.where(`#actor climbs a mountain`);

        return expect(Lara.attemptsTo(ClimbAMountain()))
            .to.be.rejectedWith(ImplementationPendingError, `A task where "#actor climbs a mountain" has not been implemented yet`);
    });
});
