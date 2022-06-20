import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected, TestSuiteFinished, TestSuiteStarts } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, ExecutionSkipped, ExecutionSuccessful, FeatureTag, ImplementationPending, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { jasmine } from '../src/jasmine';

describe('@serenity-js/jasmine', function () {

    /**
     * @see https://jasmine.github.io/tutorials/custom_reporter
     */
    describe('to meet the requirements for custom reporters', () => {

        /**
         * @see https://jasmine.github.io/examples/jasmine_failure_types.js
         */
        it('recognises "all the possible" failure modes', () =>
            jasmine(
                'examples/custom-reporter-requirements/jasmine_failure_types.js',
                '--random=false',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(TestSuiteStarts,      event => expect(event.details.name).to.equal(new Name(`a suite`)))
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`a spec`)))
                    .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag('a suite')))
                    .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished,        event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                        expect(outcome.error).to.be.instanceof(Error);
                        expect(outcome.error.message).to.equal('Failed: spec');                             // there's no message when the spec body is missing
                    })
                    .next(TestSuiteFinished,    event => {
                        expect(event.details.name).to.equal(new Name(`a suite`));
                        expect(event.outcome).to.be.instanceof(ExecutionFailedWithError);
                        expect((event.outcome as ExecutionFailedWithError).error.message).to.equal('Failed: suite beforeAll');
                    })
                ;
            }));

        /**
         * @see https://jasmine.github.io/examples/jasmine_exclusions.js
         */
        it('recognises the pending, excluded and skipped scenarios', () =>
            jasmine(
                'examples/custom-reporter-requirements/jasmine_exclusions.js',
                '--random=false',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`pending suite will be pending`)))
                    .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag(`focused suite, excludes other suites and specs`)))
                    .next(SceneFinished,        event => expect(event.outcome).to.be.instanceof(ImplementationPending))

                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`pending spec`)))
                    .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag(`focused suite, excludes other suites and specs`)))
                    .next(SceneFinished,        event => expect(event.outcome).to.be.instanceof(ImplementationPending))

                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`spec`)))
                    .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag(`focused suite, excludes other suites and specs`)))
                    .next(SceneFinished,        event => expect(event.outcome).to.be.instanceof(ExecutionSuccessful))

                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`will be excluded`)))
                    .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag(`excluded suite`)))
                    .next(SceneFinished,        event => expect(event.outcome).to.be.instanceof(ExecutionSkipped))
                ;
            }));
    });
});
