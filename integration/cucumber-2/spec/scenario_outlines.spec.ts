import { expect, ifExitCodeIsOtherThan, logOutput, Pick } from '@integration/testing-tools';
import { SceneFinished, SceneParametersDetected, SceneSequenceDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { Category, Description, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { cucumber } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        'promise',
        'callback',
        'synchronous',
    ]).
    it('recognises scenario outlines as sequences of scenes', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/scenario_outlines.feature',
        ).
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

            Pick.from(res.events)
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
                    expect(event.value.values).to.deep.equal({ result: 'fails' });
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
