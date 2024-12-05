import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Click, ModalDialog, Navigate, Text } from '@serenity-js/web';

import { ModalDialogInspector } from './fixtures/ModalDialogInspector';

describe('ModalDialog', () => {

    describe('when working with alert(),', () => {

        beforeEach(async () => {
            await actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/alert.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            );
        });

        it('dismisses the alert by default', async () => {
            await actorCalled('Nick').attemptsTo(
                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('accepted')),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
            );
        });

        it('allows the actor to accept an alert', async () => {
            await actorCalled('Nick').attemptsTo(

                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('accepted')),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
            );
        });

        it(`allows the actor to dismiss an alert`, async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('accepted')),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
            );
        });

        it('allows the actor to read the message of an accepted alert', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(ModalDialog.lastDialogMessage(), equals('Hello!')),
            );
        });

        it('allows the actor to read the message of a dismissed alert', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(ModalDialog.lastDialogMessage(), equals('Hello!')),
            );
        });
    });
});
