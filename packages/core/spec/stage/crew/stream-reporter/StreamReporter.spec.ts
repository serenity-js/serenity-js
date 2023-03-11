import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';
import { Writable } from 'stream';

import { Actor, Cast, Clock, Duration, ErrorFactory, Stage, StageManager, StreamReporter, Timestamp } from '../../../../src';
import { TestRunFinished } from '../../../../src/events';
import { ExecutionSuccessful } from '../../../../src/model';
import { expect } from '../../../expect';

describe('StreamReporter', () => {

    let stage:          Stage,
        output:         sinon.SinonStubbedInstance<Writable>;

    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    beforeEach(() => {
        stage = new Stage(
            new Extras(),
            new StageManager(Duration.ofSeconds(2), new Clock()),
            new ErrorFactory(),
        );

        output = sinon.createStubInstance(Writable);
    });

    it('prints the events it receives to output stream', () => {
        const reporter = new StreamReporter(output as unknown as Writable, stage);
        stage.assign(reporter);

        stage.announce(new TestRunFinished(new ExecutionSuccessful(), Timestamp.fromJSON('2021-01-13T18:00:00Z')));

        expect(output.write).to.have.been.calledWith(
            `{"type":"TestRunFinished","event":{"outcome":{"code":64},"timestamp":"2021-01-13T18:00:00.000Z"}}\n`
        );
    });
});
