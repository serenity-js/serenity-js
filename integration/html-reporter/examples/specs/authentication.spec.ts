import { Ensure, equals, not } from '@serenity-js/assertions';
import { Duration, Task, the, Wait } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('Authentication', () => {

    describe('Login', () => {

        it('should log in with valid credentials', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor enters username "alice"`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor enters password`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor clicks the sign-in button`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });

        it('should reject invalid credentials', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor enters username "unknown"`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor enters wrong password`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor clicks the sign-in button`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor sees the error message`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });

        it('should display a timeout error when the server is slow', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor enters credentials`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
                Task.where(the`#actor submits the login form`,
                    // Simulate a timeout failure
                    Wait.upTo(Duration.ofMilliseconds(50)).until(
                        Page.current().title(), equals('Will never match - simulating timeout'),
                    ),
                ),
            );
        });
    });

    describe('Password Reset', () => {

        it('should send a password reset email', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Task.where(the`#actor requests a password reset for "alice@example.com"`,
                    Ensure.that(Page.current().title(), not(equals(''))),
                ),
            );
        });

        it('should validate the reset token', async ({ actor }) => {
            await actor.attemptsTo(
                Task.where(the`#actor validates reset token`),
            );
        });
    });
});
