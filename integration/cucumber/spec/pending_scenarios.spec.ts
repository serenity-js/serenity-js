import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { cucumber, Pick } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        'synchronous',
        'promise',
        'callback',
    ]).
    it(`recognises a pending scenario where some steps are marked as 'pending'`, (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/pending_scenarios.feature',
            '--name', 'A scenario with steps marked as pending',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario with steps marked as pending')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given a step that's marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ImplementationPending()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));

    given([
        'synchronous',
        'promise',
        'callback',
    ]).
    it(`recognises a pending scenario where some steps are marked as 'pending'`, (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/pending_scenarios.feature',
            '--name', 'A scenario with steps that have not been implemented yet',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario with steps that have not been implemented yet')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given a step that hasn't been implemented yet`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ImplementationPending()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));

    given([
        'synchronous',
        'promise',
        'callback',
    ]).
    it(`recognises a scenario tagged as 'pending'`, (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', `features/support/wip_hook.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/pending_scenarios.feature',
            '--name', 'A scenario which tag marks it as pending',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario which tag marks it as pending')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given step number one that passes`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`And step number two that is marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`And step number three that fails`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));
});
