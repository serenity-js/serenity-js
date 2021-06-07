import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { actorCalled, configure, engage } from '@serenity-js/core';
import { AsyncOperationCompleted, InteractionFinished } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';
import { by } from 'protractor';

import { Accept, Click, Dismiss, Enter, ModalDialog, Navigate, Photographer, TakePhotosOfInteractions, Target, Text, Wait } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

/** @test {ModalDialog} */
describe('ModalDialog,', function () {

    const Example = {
        trigger:    Target.the('alert trigger').located(by.id('trigger')),
        result:     Target.the('result').located(by.id('result')),
    }

    beforeEach(() => engage(new UIActors()));

    describe('when working with alert(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to(sandboxWith(`
                    function() {
                        alert('Hello!');
                        // alert is blocking
                        return 'accepted';
                    }
                `)),
                Click.on(Example.trigger),
            ));

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Accept} */
        /** @test {Accept.the} */
        it('allows the actor to accept an alert', () =>
            actorCalled('Nick').attemptsTo(
                Accept.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to dismiss an alert', () =>
            actorCalled('Nick').attemptsTo(
                Dismiss.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to read the message on an alert', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.message(), equals('Hello!')),
                Dismiss.the(ModalDialog.window()),
            ),
        );
    });

    describe('when working with confirm(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to(sandboxWith(`
                    function() {
                        return confirm('Continue?')
                            ? 'accepted'
                            : 'dismissed';
                    }
                `)),
                Click.on(Example.trigger),
            ));

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Accept} */
        /** @test {Accept.the} */
        it('allows the actor to accept a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                Accept.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('accepted')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to dismiss a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                Dismiss.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('dismissed')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        it('allows the actor to read the message on a confirmation dialog', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.message(), equals('Continue?')),
                Dismiss.the(ModalDialog.window()),
            ),
        );
    });

    describe('when working with prompt(),', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to(sandboxWith(`
                    function() {
                        return prompt('Feeling lucky?', 'sure');
                    }
                `)),
                Click.on(Example.trigger),
            ));

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Accept} */
        /** @test {Accept.the} */
        it('allows the actor to accept a prompt', () =>
            actorCalled('Nick').attemptsTo(
                Accept.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('sure')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.window} */
        /** @test {Dismiss} */
        /** @test {Dismiss.the} */
        it('allows the actor to dismiss a prompt', () =>
            actorCalled('Nick').attemptsTo(
                Dismiss.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('')),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        it('allows the actor to read the message on a prompt', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.message(), equals('Feeling lucky?')),
                Dismiss.the(ModalDialog.window()),
            ),
        );

        /** @test {ModalDialog} */
        /** @test {ModalDialog.message} */
        /** @test {Enter.theValue} */
        it('allows the actor to enter value into a prompt', () =>
            actorCalled('Nick').attemptsTo(
                Enter.theValue('certainly').into(ModalDialog.window()),
                Accept.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('certainly')),
            ),
        );
    });

    describe('when waiting', () => {

        beforeEach(() =>
            actorCalled('Nick').attemptsTo(
                Navigate.to(sandboxWith(`
                    function() {
                        setTimeout(function() {
                            alert('Almost there!');
                            document.getElementById("result").innerHTML = 'And the wait is over :-)';
                        }, 250);
                        return 'The wait has began';
                    }
                `)),
            ));

        /** @test {ModalDialog.hasPoppedUp} */
        /** @test {Wait.until} */
        it('allows the actor to wait until a modal dialog is present', () =>
            actorCalled('Nick').attemptsTo(
                Ensure.that(ModalDialog.hasPoppedUp(), isFalse()),
                Click.on(Example.trigger),
                Wait.until(ModalDialog.hasPoppedUp(), isTrue()),
                Accept.the(ModalDialog.window()),
                Ensure.that(Text.of(Example.result), equals('And the wait is over :-)')),
            ),
        );
    });

    describe('when interacting with the Photographer,', () => {

        let recorder: EventRecorder;

        beforeEach(() => {
            recorder = new EventRecorder();

            configure({
                actors: new UIActors(),
                crew: [
                    Photographer.whoWill(TakePhotosOfInteractions),
                    recorder,
                ]
            })
        });

        /** @test {Photographer} */
        it('is does not negatively impact the screenshot capture process', () =>
            actorCalled('Nick').attemptsTo(
                Navigate.to(sandboxWith(`
                    function() {
                        return alert('All good?');
                    }
                `)),
                Click.on(Example.trigger),
                Accept.the(ModalDialog.window()),
            ).
            then(() => {
                PickEvent.from(recorder.events)
                    .next(AsyncOperationCompleted, ({ taskDescription }: AsyncOperationCompleted) => {
                        expect(taskDescription.value).to.include(`Took screenshot of 'Nick navigates`);
                    })
                    .next(AsyncOperationCompleted, ({ taskDescription }: AsyncOperationCompleted) => {
                        expect(taskDescription.value).to.include(`Aborted taking screenshot of 'Nick clicks on the alert trigger' because of UnexpectedAlertOpenError`);
                    })
                    .next(InteractionFinished, ({ details }: InteractionFinished) => {
                        expect(details.name).to.equal(new Name('Nick accepts the modal dialog window'));
                    })
            }),
        );

    });
});

function sandboxWith(script: string) {
    return pageFromTemplate(`
                <html>
                <body>
                    <button id="trigger" onclick="trigger()">Trigger Alert</button>
                    <p id="result"></p>
                    <script>
                        function trigger() {
                            document.getElementById("result").innerHTML = (${script})();
                        }
                    </script>
                </body>
                </html>
            `)
}
