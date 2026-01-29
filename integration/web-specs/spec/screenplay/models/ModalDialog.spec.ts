import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, Clock, LogicError, Serenity, serenity, Wait } from '@serenity-js/core';
import {
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    InteractionFinished,
    SceneFinishes,
    SceneStarts
} from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { Click, ModalDialog, Navigate, Photographer, TakePhotosOfInteractions } from '@serenity-js/web';

import { defaultCardScenario, sceneId } from '../../stage/crew/photographer/fixtures';
import { ModalDialogInspector } from './fixtures/ModalDialogInspector';

describe('ModalDialog', () => {

    describe('when waiting', () => {

        beforeEach(async () => {
            await actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/delayed-alert.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            );
        });

        it('allows the actor to wait until a modal dialog is present', async () => {
            await actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog, not(isPresent())),
                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Wait.until(ModalDialog, isPresent()),
                Ensure.eventually(ModalDialogInspector.result(), equals('And the wait is over :-)')),
            );
        });
    });

    describe('error handling ', () => {

        it(`complains when attempting to access the message of a modal dialog that hasn't been handled yet`, async () => {
            const actor = actorCalled('Nick');

            await expect(actor.answer(ModalDialog.lastDialogMessage()))
                .to.be.rejectedWith(LogicError, `Can't retrieve the message of a modal dialog that hasn't been handled yet`)
        });
    })

    describe('when interacting with the Photographer,', () => {

        it('dismisses dialogs by default, therefore allowing for screenshots to be taken', async () => {

            const clock = new Clock();
            const actors = (serenity as any).stage.cast
            const localSerenity = new Serenity(clock);
            const recorder = new EventRecorder();

            localSerenity.configure({
                actors,
                crew: [
                    Photographer.whoWill(TakePhotosOfInteractions),
                    recorder
                ],
            });

            localSerenity.announce(new SceneStarts(sceneId, defaultCardScenario))

            await localSerenity.theActorCalled('Nick').attemptsTo(
                Navigate.to(`/screenplay/models/modal-dialog/void-alert.html`),

                Click.on(ModalDialogInspector.trigger()),
            );

            localSerenity.announce(new SceneFinishes(sceneId, new ExecutionSuccessful()));
            await localSerenity.waitForNextCue();

            let asyncOperationId: CorrelationId;

            PickEvent.from(recorder.events)
                .next(AsyncOperationAttempted, ({ correlationId }: AsyncOperationCompleted) => {
                    asyncOperationId = correlationId;
                })
                .next(AsyncOperationCompleted, ({ correlationId }: AsyncOperationCompleted) => {
                    expect(asyncOperationId).to.be.instanceOf(CorrelationId);
                    expect(asyncOperationId).to.equal(correlationId);
                })
                .next(InteractionFinished, ({ details }: InteractionFinished) => {
                    expect(details.name).to.equal(new Name('Nick clicks on the modal dialog trigger'));
                });
        });
    });
});
