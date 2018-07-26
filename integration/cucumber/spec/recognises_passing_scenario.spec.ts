import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { cucumber } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        'synchronous',
        'promise',
        'callback',
    ]).
    it('recognises a passing scenario', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            // '--require', 'features/support/before_hook.ts',
            // '--require', 'features/support/after_hook.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/passing_scenario.feature',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            expect(res.events).to.have.lengthOf(6);

            expect(res.events[0]).to.be.instanceOf(SceneStarts)
                .and.have.property('value')
                .that.has.property('name')
                .equal(new Name('A passing scenario'));

            expect(res.events[1]).to.be.instanceOf(TestRunnerDetected)
                .and.have.property('value').equal(new Name('Cucumber'));

            expect(res.events[2]).to.be.instanceOf(SceneTagged)
                .and.have.property('tag')
                .equal(new FeatureTag('Serenity/JS recognises a passing scenario'));

            expect(res.events[3]).to.be.instanceOf(ActivityStarts)
                .and.have.property('value')
                .that.has.property('name')
                .equal(new Name('Given a step that passes'));

            expect(res.events[4]).to.be.instanceOf(ActivityFinished)
                .and.have.property('outcome')
                .equal(new ExecutionSuccessful());

            expect(res.events[5]).to.be.instanceOf(SceneFinished)
                .and.have.property('outcome')
                .equal(new ExecutionSuccessful());
        }));
});
