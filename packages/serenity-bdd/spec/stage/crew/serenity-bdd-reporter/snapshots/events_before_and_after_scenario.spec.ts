/* eslint-disable unicorn/filename-case */
import { contentsOf, EventRecorder, EventStreamEmitter, expect } from '@integration/testing-tools';
import type { Actor, Cast} from '@serenity-js/core';
import { Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';
import { TestReport } from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { SerenityBDDReporter } from '../../../../../src';

describe('SerenityBDDReporter', () => {

    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(2);

    let reporter: SerenityBDDReporter,
        stage: Stage,
        emitter: EventStreamEmitter,
        recorder: EventRecorder;

    beforeEach(() => {
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()), new ErrorFactory(), clock, interactionTimeout);
        emitter = new EventStreamEmitter(stage);
        recorder = new EventRecorder([], stage);

        reporter = new SerenityBDDReporter(stage);

        stage.assign(recorder);
        stage.assign(reporter);
    });

    it(`includes orphaned events that happened before the scenario in first scenario, and those that happened after - in last scenario`, async () => {
        await emitter.emit(
            contentsOf(__dirname, 'examples', 'scenario_with_interactions_in_before_and_after_hooks.events'),
        );

        const reports: TestReport[] = testReportsFrom(recorder.events);
        expect(reports).to.have.lengthOf(1);

        const generated = reports[0].map(report => report);
        const expected = JSON.parse(contentsOf(__dirname, 'examples', 'scenario_with_interactions_in_before_and_after_hooks.json'));

        expect(generated).to.deep.equal(expected);
    });

    it(`includes events that happened in beforeAll hook`, async () => {
        await emitter.emit(
            contentsOf(__dirname, 'examples', 'issue-1162-scenario_with_interactions_in_before_all_hook.events'),
        );

        const reports: TestReport[] = testReportsFrom(recorder.events);
        expect(reports).to.have.lengthOf(2);

        const generated = reports.map(report => report.map(data => data));
        const expected = JSON.parse(contentsOf(__dirname, 'examples', 'issue-1162-scenario_with_interactions_in_before_all_hook.json'));

        expect(generated).to.deep.equal(expected);
    });
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
