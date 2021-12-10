/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { Navigate, PageElement, Switch, Text } from '@serenity-js/web';
import { error } from 'selenium-webdriver';

import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

/** @test {Switch} */
describe('Switch', () => {

    const
        h1 = PageElement.locatedByCss('h1').describedAs('the header'),
        iframe = PageElement.locatedByTagName('iframe').describedAs('test iframe');

    const page =
        (header: string) =>
            pageFromTemplate(`
                <html>
                    <body>
                        <h1>${ header }</h1>
                    </body>
                </html>
            `);

    const pageWithIframe =
        (header: string, iframeSource: string) =>
            pageFromTemplate(`
                <html>
                    <body>
                        <h1>${ header }</h1>
                        <iframe name="example-iframe" src="${ iframeSource.replace(/"/g, '&quot;') }" />
                    </body>
                </html>
            `);

    beforeEach(() => engage(new UIActors()));

    describe('when working with frames', () => {

        describe('toFrame()', () => {

            /** @test {Switch.toFrame} */
            it(`should complain if there's no frame to switch to`, () =>
                expect(actorCalled('Franceska').attemptsTo(
                    Navigate.to(page('main page')),
                    Switch.toFrame(0),
                )).to.be.rejectedWith(error.NoSuchFrameError));

            /** @test {Switch.toFrame} */
            it('should switch to an iframe identified by Question<ElementFinder>', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('main page', page('an iframe'))),
                    Ensure.that(Text.of(h1), equals('main page')),

                    Switch.toFrame(iframe),
                    Ensure.that(Text.of(h1), equals('an iframe')),
                ));

            /** @test {Switch.toFrame} */
            it('should switch to an iframe identified by index', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('main page', page('an iframe'))),
                    Ensure.that(Text.of(h1), equals('main page')),

                    Switch.toFrame(0),
                    Ensure.that(Text.of(h1), equals('an iframe')),
                ));

            /** @test {Switch.toFrame} */
            it('should switch to an iframe identified by name', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('main page', page('an iframe'))),
                    Ensure.that(Text.of(h1), equals('main page')),

                    Switch.toFrame('example-iframe'),
                    Ensure.that(Text.of(h1), equals('an iframe')),
                ));

            describe('should provide a sensible description when the iframe', () => {

                /** @test {Switch.toFrame} */
                /** @test {Switch#toString} */
                it('is specified by Question<ElementFinder>', () => {
                    expect(Switch.toFrame(iframe).toString()).to.equal('#actor switches to frame: test iframe')
                });

                /** @test {Switch.toFrame} */
                /** @test {Switch#toString} */
                it('is specified by index number', () => {
                    expect(Switch.toFrame(1).toString()).to.equal('#actor switches to frame: 1')
                });

                /** @test {Switch.toFrame} */
                /** @test {Switch#toString} */
                it('is specified by name', () => {
                    expect(Switch.toFrame('example-iframe').toString()).to.equal('#actor switches to frame: example-iframe')
                });
            });
        });

        describe('toParentFrame()', () => {

            /** @test {Switch.toParentFrame} */
            it('should not switch the frame if there are no parent frames', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(page('main page')),
                    Ensure.that(Text.of(h1), equals('main page')),

                    Switch.toParentFrame(),
                    Ensure.that(Text.of(h1), equals('main page')),
                ));

            /** @test {Switch.toParentFrame} */
            it('should switch to the parent hosting an iframe', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('main page', page('an iframe'))),
                    Ensure.that(Text.of(h1), equals('main page')),

                    Switch.toFrame(iframe),
                    Ensure.that(Text.of(h1), equals('an iframe')),

                    Switch.toParentFrame(),
                    Ensure.that(Text.of(h1), equals('main page')),
                ));

            /** @test {Switch.toFrame} */
            /** @test {Switch.toParentFrame} */
            it('should support nested frames', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('Level 0', pageWithIframe('Level 1', page('Level 2')))),
                    Ensure.that(Text.of(h1), equals('Level 0')),

                    Switch.toFrame(iframe),
                    Ensure.that(Text.of(h1), equals('Level 1')),

                    Switch.toFrame(iframe),
                    Ensure.that(Text.of(h1), equals('Level 2')),

                    Switch.toParentFrame(),
                    Ensure.that(Text.of(h1), equals('Level 1')),
                ));

            /** @test {Switch.toParentFrame} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toParentFrame().toString()).to.equal('#actor switches to parent frame')
            });
        });

        describe('toDefaultContent()', () => {

            /** @test {Switch.toDefaultContent} */
            it('should not switch the frame if there are no parent frames', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(page('main page')),
                    Ensure.that(Text.of(h1), equals('main page')),

                    Switch.toDefaultContent(),
                    Ensure.that(Text.of(h1), equals('main page')),
                ));

            /** @test {Switch.toFrame} */
            /** @test {Switch.toDefaultContent} */
            it('should support nested frames', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('Level 0', pageWithIframe('Level 1', page('Level 2')))),
                    Ensure.that(Text.of(h1), equals('Level 0')),

                    Switch.toFrame(iframe),
                    Ensure.that(Text.of(h1), equals('Level 1')),

                    Switch.toFrame(iframe),
                    Ensure.that(Text.of(h1), equals('Level 2')),

                    Switch.toDefaultContent(),
                    Ensure.that(Text.of(h1), equals('Level 0')),
                ));

            /** @test {Switch.toDefaultContent} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toDefaultContent().toString()).to.equal('#actor switches to default content')
            });
        });

        describe('toFrame().and()', () => {

            /** @test {Switch.toFrame} */
            it('should perform any activities in the context of the frame it switched to', () =>
                actorCalled('Franceska').attemptsTo(
                    Navigate.to(pageWithIframe('Level 0', pageWithIframe('Level 1', page('Level 2')))),
                    Ensure.that(Text.of(h1), equals('Level 0')),

                    Switch.toFrame(iframe).and(
                        Switch.toFrame(iframe).and(
                            Ensure.that(Text.of(h1), equals('Level 2')),
                        ),
                        Ensure.that(Text.of(h1), equals('Level 1')),
                    ),
                    Ensure.that(Text.of(h1), equals('Level 0')),
                ));

            /** @test {Switch.toFrame} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toFrame(0).and().toString()).to.equal('#actor switches to frame: 0')
            });
        });
    });
});
