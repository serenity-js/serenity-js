import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, SpawnResult } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunnerDetected, TestRunStarts } from '@serenity-js/core/lib/events';
import { CapabilityTag, CorrelationId, ExecutionSuccessful, FeatureTag, Name,ThemeTag } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { jasmineSpawner } from '../src/jasmine';

describe('@serenity-js/jasmine', function () {

    this.timeout(30000);

    it('recognises a passing scenario', () => jasmine('examples/my_super_theme/my_theme/my_capability/my_feature.spec.js')
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            let currentSceneId: CorrelationId;

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('My super theme')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('My theme')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('My capability')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('My feature')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinishes,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(SceneFinished,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});

function jasmine(...params: string[]): Promise<SpawnResult> {
    return jasmineSpawner(
        ...params,
        '--random=false',
        `--require=${ path.resolve(__dirname, '../examples/programmatic-reporter.js') }`,
        `--require=${ path.resolve(__dirname, '../examples/setup.js') }`,
    );
}
