import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Click, ModalDialog, Navigate, Text } from '@serenity-js/web';

import { ModalDialogInspector } from './fixtures/ModalDialogInspector';

describe('ModalDialog', () => {

    describe('when working with confirm(),', () => {

        beforeEach(async () => {
            await actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/confirm.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            );
        });

        it('dismisses the confirmation dialog by default', async () => {
            await actorCalled('Nick').attemptsTo(
                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('dismissed')),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
            );
        });

        it('allows the actor to accept a confirmation dialog', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('accepted')),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
            );
        });

        it(`allows the actor to dismiss a confirmation dialog`, async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('dismissed')),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
            );
        });

        it('allows the actor to read the message of an accepted confirmation dialog', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(ModalDialog.lastDialogMessage(), equals('Continue?')),
            );
        });

        it('allows the actor to read the message of a dismissed confirmation dialog', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(ModalDialog.lastDialogMessage(), equals('Continue?')),
            );
        });
    });
});
