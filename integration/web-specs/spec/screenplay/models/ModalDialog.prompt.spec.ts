import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Click, ModalDialog, Navigate, Text } from '@serenity-js/web';

import { ModalDialogInspector } from './fixtures/ModalDialogInspector';

describe('ModalDialog', () => {

    describe('when working with prompt(),', () => {

        beforeEach(async () => {
            await actorCalled('Nick').attemptsTo(
                Navigate.to('/screenplay/models/modal-dialog/prompt.html'),

                Ensure.that(ModalDialog.lastDialogState(), equals('absent')),
            );
        });

        it('dismisses the prompt by default', async () => {
            await actorCalled('Nick').attemptsTo(
                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('dismissed')),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
            );
        });

        it('allows the actor to accept a prompt with the default value', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('default value')),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
            );
        });

        it('allows the actor to dismiss a prompt', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('dismissed')),

                Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
            );
        });

        it('allows the actor to read the message on an accepted prompt', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(ModalDialog.lastDialogMessage(), equals('Your answer?')),
            );
        });

        it('allows the actor to read the message on a dismissed prompt', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.dismissNext(),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(ModalDialog.lastDialogMessage(), equals('Your answer?')),
            );
        });

        it('allows the actor to enter value into a prompt', async () => {
            await actorCalled('Nick').attemptsTo(
                ModalDialog.acceptNextWithValue('certainly'),

                Click.on(ModalDialogInspector.trigger()),

                Ensure.eventually(Text.of(ModalDialogInspector.result()), equals('certainly')),

                Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
            );
        });
    });
});
