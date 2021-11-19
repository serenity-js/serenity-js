import 'mocha';

import { actorCalled, Note, TakeNote } from '@serenity-js/core';
import { by, Navigate, Page, Target, Text } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';
import { Ensure, equals, not } from '@serenity-js/assertions';

describe('Page', () => {

    /*
    todo:
    Title.of(Page.current()) === Page.current().title() === Page.title()
    Page.title()
    Switch.to(Page.original())
    Switch.to(Page.called(...))
    Page.called(...).title()
        auto-switch to appropriate window and switch back
     */

    describe('current()', () => {

        describe('toString()', () => {

            /** @test {Page.current()} */
            /** @test {Page#toString()} */
            it('returns a human-readable description of the question being asked', () => {
                const description = Page.current().toString();

                expect(description).to.equal('current page');
            });
        });

        describe('title()', () => {

            beforeEach(() =>
                actorCalled('Bernie').attemptsTo(
                    Navigate.to('/screenplay/questions/page/title.html'),
                ));

            /** @test {Page.current()} */
            /** @test {Page#title()} */
            it('allows the actor to read the <title /> of the current page', async () => {
                const page  = await Page.current().answeredBy(actorCalled('Bernie'));
                const title = await page.title();

                expect(title).to.equal('Hello World');
            });

            /** @test {Page.current()} */
            /** @test {Page#title()} */
            it('is accessible via a Model', async () =>
                actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.current().title(), equals(`Hello World`)),
                ));
        });

        describe('viewport', () => {

            const RenderedViewportSize = {
                width:  Text.of(Target.the('viewport width').located(by.id('viewport-width'))).as(Number),
                height: Text.of(Target.the('viewport height').located(by.id('viewport-height'))).as(Number),
            };

            const viewportSize = {
                small:  { width: 640, height: 480 },
                medium: { width: 667, height: 375 },    // iPhone 8, something in the middle, but still representative of what people might use
                large:  { width: 800, height: 600 },
            }

            before(() =>
                actorCalled('Bernie').attemptsTo(
                    Navigate.to('/screenplay/questions/page/viewport_size.html'),
                    TakeNote.of(Page.current().viewportSize()).as('original viewport size')
                ));

            beforeEach(() =>
                actorCalled('Bernie').attemptsTo(
                    Page.current().setViewportSize(Note.of('original viewport size')),
                ));

            after(() =>
                actorCalled('Bernie').attemptsTo(
                    Page.current().setViewportSize(Note.of('original viewport size')),
                ));

            describe('setViewportSize()', () => {

                /** @test {Page.current()} */
                /** @test {Page#viewportSize()} */
                /** @test {Page#setViewportSize()} */
                it('allows the actor to set the size of the viewport', () =>
                    actorCalled('Bernie').attemptsTo(
                        Page.current().setViewportSize(viewportSize.small)
                            .describedAs(`#actor resizes viewport to ${ viewportSize.small.width }x${ viewportSize.small.height }`),

                        Ensure.that(RenderedViewportSize.height, equals(viewportSize.small.height)),
                        Ensure.that(RenderedViewportSize.width,  equals(viewportSize.small.width)),
                    )
                );

                /** @test {Page.current()} */
                /** @test {Page#viewportSize()} */
                /** @test {Page#setViewportSize()} */
                it('allows the actor to increase the size of the viewport', () =>
                    actorCalled('Bernie').attemptsTo(
                        Page.current().setViewportSize(viewportSize.small)
                            .describedAs(`#actor resizes viewport to ${ viewportSize.small.width }x${ viewportSize.small.height }`),

                        Ensure.that(RenderedViewportSize.height, equals(viewportSize.small.height)),
                        Ensure.that(RenderedViewportSize.width,  equals(viewportSize.small.width)),

                        Page.current().setViewportSize(viewportSize.medium)
                            .describedAs(`#actor resizes viewport to ${ viewportSize.medium.width }x${ viewportSize.medium.height }`),

                        Ensure.that(RenderedViewportSize.height, equals(viewportSize.medium.height)),
                        Ensure.that(RenderedViewportSize.width,  equals(viewportSize.medium.width)),
                    )
                );

                /** @test {Page.current()} */
                /** @test {Page#viewportSize()} */
                /** @test {Page#setViewportSize()} */
                it('allows the actor to decrease the size of the viewport', () =>
                    actorCalled('Bernie').attemptsTo(
                        Page.current().setViewportSize(viewportSize.large)
                            .describedAs(`#actor resizes viewport to ${ viewportSize.large.width }x${ viewportSize.large.height }`),

                        Ensure.that(RenderedViewportSize.height, equals(viewportSize.large.height)),
                        Ensure.that(RenderedViewportSize.width,  equals(viewportSize.large.width)),

                        Page.current().setViewportSize(viewportSize.medium)
                            .describedAs(`#actor resizes viewport to ${ viewportSize.medium.width }x${ viewportSize.medium.height }`),

                        Ensure.that(RenderedViewportSize.height, equals(viewportSize.medium.height)),
                        Ensure.that(RenderedViewportSize.width,  equals(viewportSize.medium.width)),
                    )
                );
            });

            describe('viewportSize()', () => {

                it('returns the real size of the viewport', () =>
                    actorCalled('Bernie').attemptsTo(
                        Ensure.that(Page.current().viewportSize(), not(equals(viewportSize.medium))),

                        Page.current().setViewportSize(viewportSize.medium)
                            .describedAs(`#actor resizes viewport to ${ viewportSize.medium.width }x${ viewportSize.medium.height }`),

                        Ensure.that(Page.current().viewportSize(), equals(viewportSize.medium)),
                    )
                );
            });
        });
    });

    describe('called(name)', () => {
        describe('toString', () => {
            it('returns a human-readable description of an arbitrary page', () => {
                const description = Page.called('new-window').toString();

                expect(description).to.equal('page called "new-window"');
            })
        });

        describe('title', () => {
            it('allows the actor to read the <title /> of an arbitrary page')

            it('complains if the page the actor want to read the title of does not exist')

            it('automatically switches the context back to the original page afterwards')
        });
    });


    // describe('url', () => {
    //
    //     /** @test {Website} */
    //     it('allows the actor to read the URL of the website', () =>
    //         actorCalled('Bernie').attemptsTo(
    //             Navigate.to(`/screenplay/questions/website/title.html`),
    //
    //             Ensure.that(Website.url(), endsWith(`/screenplay/questions/website/title.html`)),
    //         ));
    //
    //     /**
    //      *  @test {Website}
    //      *  @see https://github.com/serenity-js/serenity-js/issues/273
    //      */
    //     it(`correctly represents the URL containing special characters`, () =>
    //         actorCalled('Bernie').attemptsTo(
    //             Navigate.to(`/screenplay/questions/website/title.html#name`),
    //
    //             Ensure.that(Website.url(), endsWith(`/screenplay/questions/website/title.html#name`)),
    //         ));
    // });
});
