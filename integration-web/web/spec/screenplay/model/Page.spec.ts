import 'mocha';

import { actorCalled } from '@serenity-js/core';
import { by, Navigate, Page, Target, Text } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';

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

        describe('viewportSize()', () => {

            const RenderedViewportSize = {
                width: Target.the('viewport width').located(by.id('viewport-width')),
                height: Target.the('viewport height').located(by.id('viewport-height')),
            };

            beforeEach(() =>
                actorCalled('Bernie').attemptsTo(
                    Navigate.to('/screenplay/questions/page/viewport_size.html'),
                ));

            /** @test {Page.current()} */
            /** @test {Page#viewportSize()} */
            /** @test {Page#setViewportSize()} */
            it('allows the actor to read the inner size of the current page', async () => {
                const Bernie = actorCalled('Bernie');

                const page  = await Page.current().answeredBy(Bernie);

                const expectedSize = { width: 640, height: 480 };

                await page.setViewportSize(expectedSize);
                const reportedSize = await page.viewportSize();

                const renderedWidth     = await Text.of(RenderedViewportSize.width).as(Number).answeredBy(Bernie);
                const renderedHeight    = await Text.of(RenderedViewportSize.height).as(Number).answeredBy(Bernie);

                expect(reportedSize).to.deep.equal(expectedSize);
                expect(expectedSize.width).to.deep.equal(renderedWidth);
                expect(expectedSize.height).to.deep.equal(renderedHeight);
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
