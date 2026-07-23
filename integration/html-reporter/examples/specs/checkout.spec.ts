import { Ensure, equals, not } from '@serenity-js/assertions';
import { Task, the } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('Checkout', () => {

    describe('Cart', () => {

        it('should add an item to the cart', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor adds "Widget" to the cart`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });

        it('should remove an item from the cart', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor removes "Widget" from the cart`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });

        it('should update item quantity', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor updates quantity to 3`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });
    });

    describe('Payment', () => {

        it('should process a credit card payment', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor enters credit card details`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor submits the payment`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });

        it('should reject an expired card', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor enters expired card details`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor submits the payment`,
                    // This will fail - simulating an assertion failure in the checkout flow
                    Ensure.that(Page.current().title(), equals('Payment rejected')),
                ),
            );
        });

        it('should display payment confirmation', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor completes the payment flow`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor sees the confirmation page`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });
    });

    describe('Order Summary', () => {

        it('should display the order total', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), not(equals(''))),
            );
        });

        it('should apply a discount code', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor applies discount code "SAVE10"`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });
    });
});
