import 'mocha';

import { URL } from 'node:url';

import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals, includes, isPresent, not, startsWith } from '@serenity-js/assertions';
import { actorCalled, Duration, Interaction, LogicError, Question, Wait } from '@serenity-js/core';
import { By, Click, Navigate, Page, PageElement, Switch, Text } from '@serenity-js/web';

describe('Page', () => {

    const heading = Text.of(PageElement.located(By.css('h1')).describedAs('heading'));

    const MainPage = {
        title:          'Main page title',
        newPopUpLink:   () => PageElement.located(By.id('new-popup-link')).describedAs('new pop-up link'),
        newTabLink:     () => PageElement.located(By.id('new-tab-link')).describedAs('new tab link'),
    };

    const NewTab = {
        title:      'New tab title',
        heading:    'New tab',
        closeLink:  () => PageElement.located(By.id('close')).describedAs('close window link'),
    };

    const Popup = {
        expectedName:   'popup-window',         // defined in main_page.html
    };

    describe('when managing the page', () => {

        beforeEach(() =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/models/page/main_page.html'),
            ));

        afterEach(() =>
            actorCalled('Bernie').attemptsTo(
                Switch.to(Page.whichUrl(includes(`/screenplay/models/page/main_page.html`))),
                Page.current().closeOthers()
            ));

        describe('current()', () => {

            describe('title()', () => {

                it('returns the value of the <title /> tag of the current page', async () => {
                    const page  = await Page.current().answeredBy(actorCalled('Bernie'));
                    const title = await page.title();

                    expect(title).to.equal('Main page title');
                });

                it('is accessible via an Adapter', async () =>
                    actorCalled('Bernie').attemptsTo(
                        Ensure.that(Page.current().title(), equals(`Main page title`)),
                    ));
            });

            describe('url()', () => {

                it('returns the URL of the current page', async () => {
                    const page      = await Page.current().answeredBy(actorCalled('Bernie'));
                    const url: URL  = await page.url();

                    expect(url.pathname).to.equal('/screenplay/models/page/main_page.html');
                });

                it('is accessible via an Adapter', async () =>
                    actorCalled('Bernie').attemptsTo(
                        Ensure.that(Page.current().url().pathname, equals(`/screenplay/models/page/main_page.html`)),
                    ));

                /**
                 * @see https://github.com/serenity-js/serenity-js/issues/273
                 */
                it(`correctly represents URLs containing special characters`, () =>
                    actorCalled('Bernie').attemptsTo(
                        Navigate.to(`/screenplay/models/page/main_page.html#example`),

                        Ensure.that(Page.current().url().hash, equals(`#example`)),
                    ));
            });
        });

        describe('whichName(expectation)', () => {

            beforeEach(() =>
                actorCalled('Bernie').attemptsTo(
                    Navigate.to('/screenplay/models/page/main_page.html'),
                    Click.on(MainPage.newPopUpLink()),
                    Wait.until(Page.whichName(equals(Popup.expectedName)), isPresent()),
                    Page.whichTitle(equals(MainPage.title)).switchTo(),
                    Wait.until(Page.current().title(), equals(MainPage.title)),
                ));

            it('provides access to another page identified by name', () =>
                actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.whichName(startsWith('popup')).name(), equals(Popup.expectedName)),
                ));

            it('automatically switches back to the original context when the action is finished', () =>
                actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.whichName(startsWith('popup')).name(), equals(Popup.expectedName)),
                    Ensure.that(heading, equals('Main page')),
                ));

            it('complains if the page the actor wants to switch to does not exist', async () =>
                expect(actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.whichName(startsWith('invalid')).title(), equals(`this won't pass`)),
                )).to.be.rejectedWith(LogicError, `Couldn't find a page which name does start with "invalid"`),
            );
        });

        describe('Switch.to(Page)', () => {

            it('automatically switches back to the origin page after performing activities in the context of another page', () =>
                actorCalled('Bernie').attemptsTo(
                    Click.on(MainPage.newTabLink()),

                    Wait.upTo(Duration.ofSeconds(10)).until(Page.whichTitle(equals(NewTab.title)), isPresent()),

                    // click automatically switches context,
                    // so make sure we're on the main page
                    Switch.to(Page.whichTitle(equals(MainPage.title))),

                    Switch.to(Page.whichTitle(equals(NewTab.title))).and(
                        Ensure.that(heading, equals(NewTab.heading)),
                    ),

                    Ensure.that(Page.current().title(), equals(MainPage.title)),
                ));
        });
    });

    describe('when managing closed windows', () => {

        beforeEach(() =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/models/page/main_page.html'),
            ));

        afterEach(() =>
            actorCalled('Bernie').attemptsTo(
                Switch.to(Page.whichUrl(includes(`/screenplay/models/page/main_page.html`))),
                Page.current().closeOthers()
            ));

        it('correctly discards of Pages that have been closed by JavaScript', () =>
            actorCalled('Bernie').attemptsTo(
                Click.on(MainPage.newTabLink()),

                Wait.upTo(Duration.ofSeconds(10)).until(Page.whichTitle(equals(NewTab.title)), isPresent()),

                Switch.to(Page.whichTitle(equals(NewTab.title))).and(
                    Click.on(NewTab.closeLink()),
                ),

                Ensure.that(Page.whichTitle(equals(NewTab.title)), not(isPresent())),
            ));

        it('correctly discards of Pages that have been explicitly closed', () =>
            actorCalled('Bernie').attemptsTo(
                Click.on(MainPage.newTabLink()),

                Wait.until(Page.whichTitle(equals(NewTab.title)), isPresent()),

                Page.whichTitle(equals(NewTab.title)).close(),

                Ensure.that(Page.whichTitle(equals(NewTab.title)), not(isPresent())),
            ));

        it('complains when trying to switch to an explicitly closed Page', async () => {
            const result = actorCalled('Bernie').attemptsTo(
                Click.on(MainPage.newTabLink()),

                Wait.until(Page.whichTitle(equals(NewTab.title)), isPresent()),

                Page.whichTitle(equals(NewTab.title)).close(),

                Ensure.that(Page.whichTitle(equals(NewTab.title)), not(isPresent())),

                Switch.to(Page.whichTitle(equals(NewTab.title))).and(
                    Interaction.where('#actor throws an error', actor => {
                        throw new Error('Should not switch to a closed page');
                    }),
                ),
            );

            await expect(result).to.be.eventually.rejectedWith(
                LogicError,
                `Couldn't find a page which title does equal "${ NewTab.title }"`
            );
        });

        it('complains when trying to switch to a Page closed by JavaScript', async () => {
            const result = actorCalled('Bernie').attemptsTo(
                Click.on(MainPage.newTabLink()),

                Wait.upTo(Duration.ofSeconds(10)).until(Page.whichTitle(equals(NewTab.title)), isPresent()),

                Switch.to(Page.whichTitle(equals(NewTab.title))).and(
                    Click.on(NewTab.closeLink()),
                ),

                // Wait for the page to be discarded before attempting to switch to it
                // to avoid a race condition where the browser throws TargetCloseError
                // before Serenity/JS can detect the page is gone
                Wait.until(Page.whichTitle(equals(NewTab.title)), not(isPresent())),

                Switch.to(Page.whichTitle(equals(NewTab.title))).and(
                    Interaction.where('#actor throws an error', actor => {
                        throw new Error('Should not switch to a closed page');
                    }),
                ),
            );

            await expect(result).to.be.eventually.rejectedWith(
                LogicError,
                `Couldn't find a page which title does equal "${ NewTab.title }"`
            );
        });
    });

    describe('when managing the viewport size', () => {

        describe('current()', () => {

            describe('viewport', () => {

                class Viewport {
                    static width = () =>
                        Text.of(PageElement.located(By.id('viewport-width'))).as(Number);

                    static height = () =>
                        Text.of(PageElement.located(By.id('viewport-height'))).as(Number);

                    static size = () =>
                        Question.fromObject({
                            width: Viewport.width(),
                            height: Viewport.height(),
                        }).describedAs('viewport size');
                }

                const viewportSize = {
                    startingPoint: { width: 1024, height: 768 },
                    small:  { width: 640, height: 480 },
                    medium: { width: 667, height: 375 },    // iPhone 8, something in the middle, but still representative of what people might use
                    large:  { width: 800, height: 600 },
                }

                beforeEach(() =>
                    actorCalled('Bernie').attemptsTo(
                        Navigate.to('/screenplay/models/page/viewport_size.html'),
                    ));

                describe('setViewportSize()', () => {

                    beforeEach(() =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.startingPoint),
                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.startingPoint)),
                        ));

                    after(() =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.startingPoint),
                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.startingPoint)),
                        ));

                    it('allows the actor to set the size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.small)
                                .describedAs(`#actor resizes viewport to ${viewportSize.small.width}x${viewportSize.small.height}`),

                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.small)),
                        )
                    );

                    it('allows the actor to increase the size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.small)
                                .describedAs(`#actor resizes viewport to ${viewportSize.small.width}x${viewportSize.small.height}`),

                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.small)),
                            Ensure.eventually(Viewport.size(), equals(viewportSize.small)),

                            Page.current().setViewportSize(viewportSize.medium)
                                .describedAs(`#actor resizes viewport to ${viewportSize.medium.width}x${viewportSize.medium.height}`),

                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.medium)),
                        )
                    );

                    it('allows the actor to decrease the size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.large)
                                .describedAs(`#actor resizes viewport to ${viewportSize.large.width}x${viewportSize.large.height}`),

                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.large)),

                            Page.current().setViewportSize(viewportSize.medium)
                                .describedAs(`#actor resizes viewport to ${viewportSize.medium.width}x${viewportSize.medium.height}`),

                            Ensure.eventually(Page.current().viewportSize(), equals(viewportSize.medium)),
                            Ensure.eventually(Viewport.size(), equals(viewportSize.medium)),
                        )
                    );
                });

                describe('viewportSize()', () => {

                    it('returns the real size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Ensure.that(Page.current().viewportSize(), not(equals(viewportSize.medium))),

                            Page.current().setViewportSize(viewportSize.medium)
                                .describedAs(`#actor resizes viewport to ${viewportSize.medium.width}x${viewportSize.medium.height}`),

                            Ensure.that(Page.current().viewportSize(), equals(viewportSize.medium)),
                        )
                    );
                });
            });
        });
    });

    describe('when describing the page context', () => {

        describe('current().toString()', () => {

            it('returns a human-readable description of the page', () => {
                const description = Page.current().toString();

                expect(description).to.equal('current page');
            });
        });

        describe('whichName(expectation).toString()', () => {

            it('returns a human-readable description of the page', () => {
                const description = Page.whichName(equals('pop-up')).toString();

                expect(description).to.equal(`page which name does equal "pop-up"`);
            });
        });

        describe('whichTitle(expectation).toString()', () => {

            it('returns a human-readable description of the page', () => {
                const description = Page.whichTitle(equals('Serenity/JS Website')).toString();

                expect(description).to.equal(`page which title does equal "Serenity/JS Website"`);
            });
        });

        describe('whichUrl(expectation).toString()', () => {

            it('returns a human-readable description of the page', () => {
                const description = Page.whichUrl(endsWith('/articles/example.html')).toString();

                expect(description).to.equal(`page which URL does end with "/articles/example.html"`);
            });
        });
    });
});
