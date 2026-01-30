
import { contentsOf, EventRecorder, EventStreamEmitter, expect } from '@integration/testing-tools';
import type { Actor, Cast } from '@serenity-js/core';
import { Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { TestReport } from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { SerenityBDDReporter } from '../../../../../src';

const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('SerenityBDDReporter', () => {

    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(2);
    const cwd = Path.from('/home/alice/my-project');
    const workspace = {
        [`${ cwd.value }`]: {
            'spec': {},
            'src': {}
        }
    }

    let reporter: SerenityBDDReporter,
        stage: Stage,
        emitter: EventStreamEmitter,
        recorder: EventRecorder;

    beforeEach(() => {
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()), new ErrorFactory(), clock, interactionTimeout);
        emitter = new EventStreamEmitter(stage);
        recorder = new EventRecorder([], stage);

        reporter = SerenityBDDReporter
            .fromJSON({
                specDirectory: 'spec',
            })
            .build({
                stage,
                fileSystem: new FileSystem(cwd, memfs(workspace).fs),
                // SerenityBDDReporter doesn't use the outputStream, so we don't need it
                outputStream: undefined,
            });

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

    // see https://github.com/serenity-js/serenity-js/issues/1162
    it(`includes events that happened in beforeAll hook (issue 1162)`, async () => {
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
