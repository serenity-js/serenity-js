import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, Clock, Duration, Serenity, serenity, Wait } from '@serenity-js/core';
import { AsyncOperationCompleted, InteractionFinished } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';
import { By, Click, ModalDialog, Navigate, PageElement, Photographer, TakePhotosOfInteractions, Text } from '@serenity-js/web';

describe('ModalDialog', () => {

    const Example = {
        trigger:    PageElement.located(By.id('trigger')).describedAs('the alert trigger'),
        result:     PageElement.located(By.id('result')).describedAs('result'),
    }

    describe('when working with alert(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/alert.html'),
                Click.on(Example.trigger),
            ));

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Accept} */
        /** @test {Accept.the} */
        it('allows the actor to accept an alert', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().accept(),
                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to dismiss an alert', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().dismiss(),
                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to read the message on an alert', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.window().text(), equals('Hello!')),
                ModalDialog.window().dismiss(),
            ),
        );
    });

    describe('when working with confirm(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/confirm.html'),
                Click.on(Example.trigger),
            ));

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Accept} */
        /** @test {Accept.the} */
        it('allows the actor to accept a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().accept(),
                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to dismiss a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().dismiss(),
                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        it('allows the actor to read the message on a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.window().text(), equals('Continue?')),
                ModalDialog.window().dismiss(),
            ),
        );
    });

    describe('when working with prompt(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/prompt.html'),
                Wait.for(Duration.ofSeconds(3)),
                Click.on(Example.trigger),
            ));

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Accept} */
        /** @test {Accept.the} */
        it('allows the actor to accept a prompt with the default value', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().accept(),
                Ensure.that(Text.of(Example.result), equals('default value')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to dismiss a prompt', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().dismiss(),
                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        it('allows the actor to read the message on a prompt', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.window().text(), equals('Your answer?')),
                ModalDialog.window().dismiss(),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        /** @test {Enter.theValue} */
        it('allows the actor to enter value into a prompt', () =>
            actorCalled('Nick').attemptsTo(
                ModalDialog.window().enterValue('certainly'),
                Ensure.that(Text.of(Example.result), equals('certainly')),
            )
        );
    });

    describe('when waiting', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/delayed-alert.html'),
            ));

        /** @test {ModalDialog.hasPoppedUp} */
        /** @test {Wait.until} */
        it('allows the actor to wait until a modal dialog is present', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.window(), not(isPresent())),
                Click.on(Example.trigger),
                Wait.until(ModalDialog.window(), isPresent()),
                ModalDialog.window().accept(),
                Ensure.that(Text.of(Example.result), equals('And the wait is over :-)')),
            ),
        );
    });

    describe('when interacting with the Photographer,', () => {

        /** @test {Photographer} */
        it('is does not negatively impact the screenshot capture process', () => {

            const frozenClock = new Clock(() => new Date('1970-01-01'));
            const actors = (serenity as any).stage.cast
            const localSerenity = new Serenity(frozenClock);
            const recorder = new EventRecorder();

            localSerenity.configure({
                actors,
                crew: [
                    Photographer.whoWill(TakePhotosOfInteractions),
                    recorder
                ],
            });

            return localSerenity.theActorCalled('Nick').attemptsTo(
                Navigate.to(`/screenplay/models/modal-dialog/void-alert.html`),
                Click.on(Example.trigger),
                ModalDialog.window().accept()
                    .describedAs('#actor accepts the modal dialog window'),
            ).then(() => {
                PickEvent.from(recorder.events)
                    .next(AsyncOperationCompleted, ({ taskDescription }: AsyncOperationCompleted) => {
                        expect(taskDescription.value).to.include(`Took screenshot of 'Nick navigates`);
                    })
                    .next(AsyncOperationCompleted, ({ taskDescription }: AsyncOperationCompleted) => {
                        expect(taskDescription.value).to.include(`Aborted taking screenshot of 'Nick clicks on the alert trigger' because of a modal dialog obstructing the view`);
                    })
                    .next(InteractionFinished, ({ details }: InteractionFinished) => {
                        expect(details.name).to.equal(new Name('Nick accepts the modal dialog window'));
                    })
            });
        });
    });
});
