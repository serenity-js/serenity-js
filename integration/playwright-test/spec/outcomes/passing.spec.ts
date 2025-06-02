import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import { CapabilityTag, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { PlaywrightSceneId } from '@serenity-js/playwright-test/lib/events';
import { describe, it } from 'mocha';

import { playwrightTest } from '../../src/playwright-test';

describe('Passing', () => {

    describe('Test scenario', () => {

        it('is reported as successful and associated with Playwright Test ID', async () => {
            const projectName = 'default';
            const result = await playwrightTest(
                `--project=${ projectName }`,
                '--reporter=json:output/outcomes/passing.json',
                'outcomes/passing.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            const report = jsonFrom('output/outcomes/passing.json');
            const testId = report.suites[0].suites[0].suites[0].specs[0].id;
            const expectedSceneId = PlaywrightSceneId.from(projectName, { id: testId, repeatEachIndex: 0 }, { retry: 0 });

            PickEvent.from(result.events)
                .next(TestRunStarts, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts, event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.details.name).to.equal(new Name('Test scenario passes'));
                })
                .next(TestRunnerDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.name).to.equal(new Name('Playwright'))
                })
                .next(SceneTagged, event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.tag).to.equal(new CapabilityTag('Outcomes'))
                })
                .next(SceneTagged, event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.tag).to.equal(new FeatureTag('Passing'))
                })
                .next(SceneFinished, event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished, event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        });
    });
});

function jsonFrom(pathToFile: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../', pathToFile), { encoding: 'utf8' }));
}
