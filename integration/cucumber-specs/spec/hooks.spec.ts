import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { InteractionFinished, InteractionStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TaskFinished, TaskStarts } from '@serenity-js/core/lib/events';
import { Version } from '@serenity-js/core/lib/io';
import { CorrelationId, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, () => {

    when(7 <= cucumberVersion().major())
        .it('recognises Screenplay activities in any part of a Cucumber scenario', () =>
            cucumber('features/hooks.feature', 'hooks.steps.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    // before all
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeAll')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in BeforeAll')))

                    // first scenario
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('First screenplay scenario'));
                        currentSceneId = event.sceneId;
                    })
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

                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.equal(new ExecutionSuccessful());
                    })

                    // second scenario
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('Second screenplay scenario'));
                        currentSceneId = event.sceneId;
                    })
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

                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.equal(new ExecutionSuccessful());
                    })

                    // after all
                    .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in AfterAll')))
                    .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in AfterAll')))
                ;
            }));

    when(cucumberVersion().isAtLeast(new Version('8.1.0')))
        .it('recognises named hook steps', () =>
            cucumber('features/named_hooks.feature', 'named_hooks.steps.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        // first scenario
                        .next(SceneStarts,         event => {
                            expect(event.details.name).to.equal(new Name('First screenplay scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Cucumber hooks')))

                        // Before({ name: 'Perform some setup in named and tagged Before step' })
                        .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('Before: Perform some setup in named Before hook')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in named Before hook')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in named Before hook')))
                        .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('Before: Perform some setup in named Before hook')))

                        // Given
                        .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('Given Amanda fulfills a task')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Amanda performs in Given')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Amanda performs in Given')))
                        .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('Given Amanda fulfills a task')))

                        // After(After({ name: 'Perform some teardown in named After hook' })
                        .next(TaskStarts,          event => expect(event.details.name).to.equal(new Name('After: Perform some teardown in named After hook')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name('Helen performs in named After hook')))
                        .next(InteractionFinished, event => expect(event.details.name).to.equal(new Name('Helen performs in named After hook')))
                        .next(TaskFinished,        event => expect(event.details.name).to.equal(new Name('After: Perform some teardown in named After hook')))

                        .next(SceneFinishes,       event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished,       event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSuccessful());
                        })
                    ;
                }));
});
