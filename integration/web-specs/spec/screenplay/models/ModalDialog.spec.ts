import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, Clock, LogicError, Serenity, serenity, Wait } from '@serenity-js/core';
import { AsyncOperationAttempted, AsyncOperationCompleted, InteractionFinished, SceneFinishes, SceneStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, Name } from '@serenity-js/core/lib/model';
import { By, Click, ModalDialog, Navigate, Page, PageElement, Photographer, TakePhotosOfInteractions, Text } from '@serenity-js/web';

import { defaultCardScenario, sceneId } from '../../stage/crew/photographer/fixtures';

/** @test {ModalDialog} */
describe('ModalDialog', () => {

    const Example = {
        trigger:    PageElement.located(By.id('trigger')).describedAs('the modal dialog trigger'),
        result:     PageElement.located(By.id('result')).describedAs('result'),
    }

    afterEach(async () => {
        // Needed because IntelliJ ignores the `reporter` entry from .mocharc.yml
        // in favour of its own, built-in reporter. Because of that, @serenity-js/mocha is not loaded,
        // and can't emit the SceneFinishes events, which then prevents Serenity from dismissing the actors,
        // clearing their abilities, and resetting the modal.
        await actorCalled('Nick').attemptsTo(
            Page.current().modalDialog().reset(),
        )
    })

    describe('when working with alert(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/alert.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            ));

        it('dismisses the alert by default', () =>
            actorCalled('Nick').attemptsTo(

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),

                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        it('allows the actor to accept an alert', () =>
            actorCalled('Nick').attemptsTo(

                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),

                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        it('allows the actor to dismiss an alert', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),

                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        it('allows the actor to read the message of an accepted alert', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogMessage(), equals('Hello!')),
            ),
        );

        it('allows the actor to read the message of a dismissed alert', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogMessage(), equals('Hello!')),
            ),
        );
    });

    describe('when working with confirm(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/confirm.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            ));

        it('dismisses the confirmation dialog by default', () =>
            actorCalled('Nick').attemptsTo(
                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),

                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        it('allows the actor to accept a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),

                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        it('allows the actor to dismiss a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),

                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        it('allows the actor to read the message of an accepted confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogMessage(), equals('Continue?')),
            ),
        );

        it('allows the actor to read the message of a dismissed confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogMessage(), equals('Continue?')),
            ),
        );
    });

    describe('when working with prompt(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/prompt.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            ));

        it('dismisses the prompt by default', () =>
            actorCalled('Nick').attemptsTo(
                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),

                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        it('allows the actor to accept a prompt with the default value', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),

                Ensure.that(Text.of(Example.result), equals('default value')),
            ),
        );

        it('allows the actor to dismiss a prompt', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),

                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        it('allows the actor to read the message on an accepted prompt', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogMessage(), equals('Your answer?')),
            ),
        );

        it('allows the actor to read the message on a dismissed prompt', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogMessage(), equals('Your answer?')),
            ),
        );

        it('allows the actor to enter value into a prompt', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNextWithValue('certainly'),

                Click.on(Example.trigger),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
                Ensure.that(Text.of(Example.result), equals('certainly')),
            )
        );
    });

    describe('when waiting', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/delayed-alert.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            ));

        it('allows the actor to wait until a modal dialog is present', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog, not(isPresent())),
                ModalDialog.acceptNext(),

                Click.on(Example.trigger),

                Wait.until(ModalDialog, isPresent()),
                Ensure.that(Text.of(Example.result), equals('And the wait is over :-)')),
            ),
        );
    });

    describe('error handling ', () => {

        it(`complains when attempting to access the message of a modal dialog that hasn't been handled yet`, async () => {
            const actor = actorCalled('Nick');

            await expect(actor.answer(ModalDialog.lastDialogMessage()))
                .to.be.rejectedWith(LogicError, `Can't retrieve the message of a modal dialog that hasn't been handled yet`)
        });
    })

    describe('when interacting with the Photographer,', () => {

        /** @test {Photographer} */
        it('is dismisses dialogs by default, therefore allowing for screenshots to be taken', async () => {

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

                Click.on(Example.trigger),
            );

            localSerenity.announce(new SceneFinishes(sceneId));
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
