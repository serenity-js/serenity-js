/* eslint-disable unicorn/filename-case */
import 'mocha';

import { contentsOf, EventRecorder, EventStreamEmitter, expect } from '@integration/testing-tools';
import { Actor, Cast, Clock, Duration, Stage, StageManager } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent } from '@serenity-js/core/lib/events';
import { TestReport } from '@serenity-js/core/lib/model';

import { SerenityBDDReporter } from '../../../../../src';

describe('SerenityBDDReporter', () => {

    let reporter: SerenityBDDReporter,
        stage: Stage,
        emitter: EventStreamEmitter,
        recorder: EventRecorder;

    beforeEach(() => {
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()));
        emitter = new EventStreamEmitter(stage);
        recorder = new EventRecorder([], stage);

        reporter = new SerenityBDDReporter(stage);

        stage.assign(recorder);
        stage.assign(reporter);
    });

    /** @test {SerenityBDDReporter} */
    it(`includes orphaned events that happened before the scenario in first scenario, and those that happened after - in last scenario`, () => emitter.emit(
        contentsOf(__dirname, 'examples', 'scenario_with_interactions_in_before_and_after_hooks.events')
    ).then(() => {
        const reports: TestReport[] = testReportsFrom(recorder.events);
        expect(reports).to.have.lengthOf(1);

        const generated = reports[0].map(report => report);
        const expected = JSON.parse(contentsOf(__dirname, 'examples', 'scenario_with_interactions_in_before_and_after_hooks.json'));

        expect(generated).to.deep.equal(expected);
    }));
});

function testReportsFrom(events: DomainEvent[]): TestReport[] {
    return events
        .filter((e: DomainEvent) => e instanceof ArtifactGenerated && e.artifact instanceof TestReport)
        .map((e: ArtifactGenerated) => e.artifact);
}

class Extras implements Cast {
    prepare(actor: Actor): Actor {
        return actor;
    }
}
