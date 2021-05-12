import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { InteractionFinished, InteractionStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TaskFinished, TaskStarts } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises Screenplay activities in any part of a Cucumber scenario', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/hooks.steps.ts',
                './examples/features/hooks.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    // before all
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeAll')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeAll')))

                    // first scenario
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('First screenplay scenario')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Cucumber hooks')))

                    // Before
                    .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('Before')))
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in Before')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in Before')))
                    .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('Before')))

                    // Given
                    .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('Given Amanda fulfills a task')))

                        // BeforeStep
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeStep')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeStep')))

                        // ... actual Given
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Amanda performs in Given')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Amanda performs in Given')))

                        // AfterStep
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in AfterStep')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in AfterStep')))

                    .next(TaskFinished,         event => expect(event.details.name).to.equal(new Name('Given Amanda fulfills a task')))

                    // after
                    .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('After')))
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in After')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in After')))
                    .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('After')))

                    .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                    // second scenario
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Second screenplay scenario')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Cucumber hooks')))

                    // Before
                    .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('Before')))
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in Before')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in Before')))
                    .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('Before')))

                    // Given
                    .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('Given Beth fulfills a task')))

                        // BeforeStep
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeStep')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeStep')))

                        // ... actual Given
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Beth performs in Given')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Beth performs in Given')))

                        // AfterStep
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in AfterStep')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in AfterStep')))

                    .next(TaskFinished,         event => expect(event.details.name).to.equal(new Name('Given Beth fulfills a task')))

                    // after
                    .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('After')))
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in After')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in After')))
                    .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('After')))

                    .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                    // after all
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in AfterAll')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in AfterAll')))
                ;
            }));
    });
});
