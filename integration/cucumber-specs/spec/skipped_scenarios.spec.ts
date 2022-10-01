/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionSkipped, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, () => {

    when(7 <= cucumberVersion().major())
        .it(`recognises a scenario tagged as 'skipped'`, () =>
            cucumber('features/skipped_scenario.feature', [ 'common.steps.ts', 'skip_hook.ts' ], [ '--name', 'A scenario which tag marks it as skipped' ])
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('A scenario which tag marks it as skipped'));
                            currentSceneId = event.sceneId;
                        })
                        .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises skipped scenarios')))
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name(`Before`)))
                        .next(ActivityFinished, event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name(`Given step number one that passes`)))
                        .next(ActivityFinished, event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSkipped());
                        })
                    ;
                }));
});
