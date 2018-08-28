import { expect, ifExitCodeIsOtherThan, logOutput, Pick } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import 'mocha';

import { cucumber } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    it('recognises scenarios with ambiguous steps', () =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/ambiguous.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/passing_scenario.feature',
        ).
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(1);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A passing scenario')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Given a step that passes')))
                .next(ActivityFinished,    event => {
                    expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const err = (event.outcome as ExecutionFailedWithError).error;

                    const lines = err.message.split('\n');

                    expect(lines[0]).to.equal('Each step should have one matching step definition, yet there are several:');
                    expect(lines[1]).to.contain('/^.*step (?:.*) passes$/');
                    expect(lines[1]).to.contain('ambiguous.steps.ts');
                    expect(lines[2]).to.contain('/^.*step (?:.*) passes$/');
                    expect(lines[2]).to.contain('ambiguous.steps.ts');
                })
                .next(SceneFinished,       event => {
                    expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const err = (event.outcome as ExecutionFailedWithError).error;

                    expect(err.message).to.equal('Ambiguous step definition detected');
                })
            ;
        }));
});
