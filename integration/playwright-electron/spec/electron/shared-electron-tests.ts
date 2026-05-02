import 'mocha';

import { ElectronApp } from '@integration/electron-app/serenity';
import { expect } from '@integration/testing-tools';
import { Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';
import { actorCalled, Duration, Wait } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Click, Enter, Text } from '@serenity-js/web';

/**
 * Shared test suite for Electron browsing sessions.
 * This function defines tests that should pass for both externally-managed
 * and self-launching Electron sessions.
 *
 * @param sessionDescription - Description of the session type being tested
 * @param actorName - Name of the actor to use for tests (to avoid conflicts between test suites)
 */
export function describeElectronBehavior(sessionDescription: string, actorName = 'Tester'): void {

    describe(`Electron browsing session (${sessionDescription})`, () => {

        describe('reading content', () => {

            it('allows the actor to read text content from the app', async () => {
                await actorCalled(actorName).attemptsTo(
                    Ensure.that(Text.of(ElectronApp.title), equals('Serenity/JS Electron Test App')),
                );
            });

            it('allows the actor to read the app description', async () => {
                await actorCalled(actorName).attemptsTo(
                    Ensure.that(
                        Text.of(ElectronApp.description),
                        includes('example Electron application')
                    ),
                );
            });
        });

        describe('clicking on elements', () => {

            it('allows the actor to click on a button', async () => {
                await actorCalled(actorName).attemptsTo(
                    Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
                    Click.on(ElectronApp.clickButton),
                    Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
                );
            });

            it('allows the actor to click multiple times', async () => {
                await actorCalled(actorName).attemptsTo(
                    Click.on(ElectronApp.clickButton),
                    Click.on(ElectronApp.clickButton),
                    Click.on(ElectronApp.clickButton),
                    Ensure.that(
                        Text.of(ElectronApp.clickCount).as(Number),
                        isGreaterThan(0)
                    ),
                );
            });
        });

        describe('entering text', () => {

            it('allows the actor to enter text into an input field', async () => {
                await actorCalled(actorName).attemptsTo(
                    Enter.theValue('Hello Electron').into(ElectronApp.textInput),
                    Ensure.that(Text.of(ElectronApp.inputResult), equals('Hello Electron')),
                );
            });
        });

        describe('form submission', () => {

            it('allows the actor to fill and submit a form', async () => {
                await actorCalled(actorName).attemptsTo(
                    Enter.theValue('Alice').into(ElectronApp.nameInput),
                    Click.on(ElectronApp.submitButton),
                    Ensure.that(
                        Text.of(ElectronApp.result),
                        includes('Hello, Alice!')
                    ),
                );
            });
        });

        describe('browser capabilities', () => {

            it('reports Electron as the browser name', async () => {
                const browseTheWeb = BrowseTheWebWithPlaywright.as(actorCalled(actorName));
                const capabilities = await browseTheWeb.browserCapabilities();

                expect(capabilities.browserName).to.equal('electron');
            });

            it('reports the platform name', async () => {
                const browseTheWeb = BrowseTheWebWithPlaywright.as(actorCalled(actorName));
                const capabilities = await browseTheWeb.browserCapabilities();

                expect(capabilities.platformName).to.be.oneOf(['darwin', 'linux', 'win32']);
            });

            it('reports the Electron version', async () => {
                const browseTheWeb = BrowseTheWebWithPlaywright.as(actorCalled(actorName));
                const capabilities = await browseTheWeb.browserCapabilities();

                expect(capabilities.browserVersion).to.match(/^\d+\.\d+\.\d+$/);
            });
        });

        describe('window management', () => {

            it('tracks the current page', async () => {
                const browseTheWeb = BrowseTheWebWithPlaywright.as(actorCalled(actorName));
                const currentPage = await browseTheWeb.currentPage();

                expect(currentPage).to.not.be.undefined;
            });

            it('lists all open pages', async () => {
                const browseTheWeb = BrowseTheWebWithPlaywright.as(actorCalled(actorName));
                const allPages = await browseTheWeb.allPages();

                expect(allPages.length).to.be.greaterThan(0);
            });
        });

        describe('multi-window support', () => {

            it('allows the actor to open a secondary window', async () => {
                await actorCalled(actorName).attemptsTo(
                    Click.on(ElectronApp.openWindowButton),
                    Wait.for(Duration.ofMilliseconds(500)),
                    Ensure.that(
                        Text.of(ElectronApp.windowStatus),
                        equals('Secondary window opened!')
                    ),
                );

                // Verify we now have multiple windows
                const browseTheWeb = BrowseTheWebWithPlaywright.as(actorCalled(actorName));
                const allPages = await browseTheWeb.allPages();

                expect(allPages.length).to.equal(2);
            });
        });
    });
}
