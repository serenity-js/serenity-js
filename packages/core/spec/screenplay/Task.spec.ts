/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import * as sinon from 'sinon';

import { ImplementationPendingError } from '../../src/errors';
import { CorrelationId } from '../../src/model';
import { Actor, Interaction, Task } from '../../src/screenplay';
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

    /** @test {Task} */
    it('provides a convenient factory method for defining tasks', () => {

        const Lara = new Actor('Lara', stage as unknown as Stage);

        return expect(Lara.attemptsTo(ShootAnArrow())).to.be.fulfilled;
    });

    /** @test {Task} */
    it('provides a way to describe a collection of activities', () => {
        expect(ShootAnArrow().toString()).to.equal(`#actor shoots an arrow`);
    });

    /** @test {Task} */
    it('generates a pending task if no activities are provided', () => {

        const Lara = new Actor('Lara', stage as unknown as Stage);

        const ClimbAMountain = () => Task.where(`#actor climbs a mountain`);

        return expect(Lara.attemptsTo(ClimbAMountain()))
            .to.be.rejectedWith(ImplementationPendingError, `A task where "#actor climbs a mountain" has not been implemented yet`);
    });
});
