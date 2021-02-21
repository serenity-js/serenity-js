import 'mocha';
import { given } from 'mocha-testdata';
import { invoke } from '../../src/invoke';
import { trimmed } from '@serenity-js/core/lib/io';
import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name, Timestamp } from '@serenity-js/core/lib/model';

describe('@serenity-js/cucumber', function () {

    describe('CucumberCLIAdapter', () => {

        given([{
            runner: 'cucumber-1',
            config: { format: 'pretty', colors: false },
            expectedOutput: '✔ Given a step that passes'
        }, {
            runner: 'cucumber-2',
            config: { format: 'pretty', formatOptions: { colorsEnabled: false } },
            expectedOutput: '✔ Given a step that passes'
        }, {
            runner: 'cucumber-3',
            config: { format: 'usage' },
            expectedOutput: 'Pattern / Text'
        }, {
            runner: 'cucumber-4',
            config: { format: 'usage' },
            expectedOutput: 'Pattern / Text'
        }, {
            runner: 'cucumber-5',
            config: { format: 'progress' },
            expectedOutput: trimmed`
                | 1 scenario (1 passed)
                | 1 step (1 passed)
            `
        }, {
            runner: 'cucumber-6',
            config: { format: 'progress' },
            expectedOutput: trimmed`
                | 1 scenario (1 passed)
                | 1 step (1 passed)
            `
        }]).
        it('works', ({ runner, config, expectedOutput }) =>
            invoke(runner, config, 'features/passing_scenario.feature').
                then(ifExitCodeIsOtherThan(0, logOutput)).
                then(res => {
                    expect(res.exitCode).to.equal(0);

                    expect(res.stdout).to.include(expectedOutput);

                    PickEvent.from(res.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                        .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                        .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                        .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;
                }));
    });
});
