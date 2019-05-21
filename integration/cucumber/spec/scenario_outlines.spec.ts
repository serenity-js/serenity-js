import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
} from '@serenity-js/core/lib/events';
import { Category, Description, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function () {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/scenario_outlines.feature'),

        ...cucumberVersions(3, 4, 5)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/scenario_outlines.feature'),
    ]).
    it('recognises scenario outlines as sequences of scenes', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(1);

            const
                expectedScenarioName = new Name('Sample outline'),
                expectedScenarioCategory = new Category('Serenity/JS recognises scenario outlines'),
                outlineLine = 3,
                firstScenarioLine = 12,
                secondScenarioLine = 13,
                expectedExamplesName = new Name('Example results'),
                expectedExamplesDescription = new Description('Description of the examples');

            PickEvent.from(res.events)
                .next(SceneSequenceDetected, event => {
                    expect(event.value.name).to.equal(expectedScenarioName);
                    expect(event.value.category).to.equal(expectedScenarioCategory);
                    expect(event.value.location.line).to.equal(outlineLine);
                })
                .next(SceneParametersDetected, event => {
                    expect(event.scenario.name).to.equal(expectedScenarioName);
                    expect(event.scenario.category).to.equal(expectedScenarioCategory);
                    expect(event.value.name).to.equal(expectedExamplesName);
                    expect(event.value.description).to.equal(expectedExamplesDescription);
                    expect(event.value.values).to.deep.equal({ result: 'passes' });
                })
                .next(SceneStarts,          event => {
                    expect(event.value.name).to.equal(expectedScenarioName);
                    expect(event.value.category).to.equal(expectedScenarioCategory);
                    expect(event.value.location.line).to.equal(firstScenarioLine);
                })
                .next(SceneFinished,          event => {
                    expect(event.value.name).to.equal(expectedScenarioName);
                    expect(event.value.category).to.equal(expectedScenarioCategory);
                    expect(event.value.location.line).to.equal(firstScenarioLine);
                })
                .next(SceneSequenceDetected, event => {
                    expect(event.value.name).to.equal(expectedScenarioName);
                    expect(event.value.category).to.equal(expectedScenarioCategory);
                    expect(event.value.location.line).to.equal(outlineLine);
                })
                .next(SceneParametersDetected, event => {
                    expect(event.scenario.name).to.equal(expectedScenarioName);
                    expect(event.scenario.category).to.equal(expectedScenarioCategory);
                    expect(event.value.name).to.equal(expectedExamplesName);
                    expect(event.value.description).to.equal(expectedExamplesDescription);
                    expect(event.value.values).to.deep.equal({ result: 'fails with generic error' });
                })
                .next(SceneStarts,          event => {
                    expect(event.value.name).to.equal(expectedScenarioName);
                    expect(event.value.category).to.equal(expectedScenarioCategory);
                    expect(event.value.location.line).to.equal(secondScenarioLine);
                })
                .next(SceneFinished,          event => {
                    expect(event.value.name).to.equal(expectedScenarioName);
                    expect(event.value.category).to.equal(expectedScenarioCategory);
                    expect(event.value.location.line).to.equal(secondScenarioLine);
                })
            ;
        }));
});
