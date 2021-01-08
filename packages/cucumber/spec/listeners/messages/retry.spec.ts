import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes } from '@serenity-js/core/lib/events';
import { ArbitraryTag, ExecutionFailedWithError, ExecutionRetriedTag, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', function () {

    this.timeout(30000);

    describe('when working with Cucumber 7', () => {

        it('reports scenarios that have been retried and succeeded', () =>

            cucumber7(
                '--format', '../../../src',
                '--retry', '2',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/retry.steps.ts',
                './examples/features/retry.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(res => {
                expect(res.exitCode).to.equal(0);

                PickEvent.from(res.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('An eventually passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    // todo: information not available due to https://github.com/cucumber/cucumber-js/issues/1535
                    // .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('An eventually passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('An eventually passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(2)))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

                    .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                    .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
                ;
            }));

        it('reports scenarios that have been retried and failed', () =>

            cucumber7(
                '--format', '../../../src',
                '--retry', '1',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/retry.steps.ts',
                './examples/features/retry.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(res => {
                expect(res.exitCode).to.equal(1);

                PickEvent.from(res.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('An eventually passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    // todo: information not available due to https://github.com/cucumber/cucumber-js/issues/1535
                    // .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('An eventually passing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                    .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
                ;
            }));
    });
});
