
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
            'features': {},
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
                specDirectory: 'features',
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

    // see https://github.com/serenity-js/serenity-js/issues/1162
    it(`correctly associates results with retried scenario outline examples (issue 2676)`, async () => {
        await emitter.emit(
            contentsOf(__dirname, 'examples', 'issue-2676-scenario_outline_with_retry.events'),
        );

        const reports: TestReport[] = testReportsFrom(recorder.events);
        expect(reports).to.have.lengthOf(1);

        const generated = reports[0].map(report => report);
        const expected = JSON.parse(contentsOf(__dirname, 'examples', 'issue-2676-scenario_outline_with_retry.json'));

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
