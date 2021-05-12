/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage, LogicError } from '@serenity-js/core';
import { by } from 'protractor';
import { error } from 'selenium-webdriver';

import { Click, Close, Navigate, Switch, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

/** @test {Switch} */
describe('Switch', () => {

    const
        h1 = Target.the('header').located(by.css('h1')),
        iframe = Target.the('test iframe').located(by.tagName('iframe')),
        newTabLink = Target.the('link').located(by.linkText('open new tab'));

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

    const pageWithLinkToNewTab =
        (header: string) =>
            pageFromTemplate(`
                <html>
                    <body>
                        <h1>${ header }</h1>
                        <a href="javascript:void(0)" onclick="popup()">open new tab</a>
                        <script>
                            function popup() {
                                var w = window.open('', 'new-tab');
                                w.document.write('<h1>New tab</h1>');
                                w.document.close();
                            }
                        </script>
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
                    expect(Switch.toFrame(iframe).toString()).to.equal('#actor switches to frame: the test iframe')
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

    describe('when working with windows', () => {

        afterEach(() =>
            actorCalled('Ventana').attemptsTo(
                Close.anyNewWindows(),
            ));

        describe('toWindow()', () => {

            /** @test {Switch.toWindow} */
            it('should switch to a window identified by its index', () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(pageWithLinkToNewTab('Main window')),
                    Ensure.that(Text.of(h1), equals('Main window')),
                    Click.on(newTabLink),

                    Switch.toWindow(1),
                    Ensure.that(Text.of(h1), equals('New tab')),
                ));

            /** @test {Switch.toWindow} */
            it('should switch to a window identified by its name', () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(pageWithLinkToNewTab('Main window')),
                    Ensure.that(Text.of(h1), equals('Main window')),
                    Click.on(newTabLink),

                    Switch.toWindow('new-tab'),
                    Ensure.that(Text.of(h1), equals('New tab')),
                ));

            /** @test {Switch.toWindow} */
            it(`should complain if the desired window doesn't exit`, () =>
                expect(actorCalled('Ventana').attemptsTo(
                    Navigate.to(page('Main window')),

                    Switch.toWindow(10),
                )).to.be.rejectedWith(LogicError, `Window 10 doesn't exist`));

            describe('should provide a sensible description when the window', () => {

                /** @test {Switch.toWindow} */
                /** @test {Switch#toString} */
                it('is specified by its index', () => {
                    expect(Switch.toWindow(1).toString()).to.equal('#actor switches to window: 1')
                });

                /** @test {Switch.toWindow} */
                /** @test {Switch#toString} */
                it('is specified by name', () => {
                    expect(Switch.toWindow('example-window').toString()).to.equal('#actor switches to window: example-window')
                });
            });
        });

        describe('toWindow().and()', () => {

            /** @test {Switch.toWindow} */
            it('should perform any activities in the context of the window it switched to', () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(pageWithLinkToNewTab('Main window')),
                    Ensure.that(Text.of(h1), equals('Main window')),
                    Click.on(newTabLink),

                    Switch.toWindow('new-tab').and(
                        Ensure.that(Text.of(h1), equals('New tab')),
                    ),
                    Ensure.that(Text.of(h1), equals('Main window')),
                ));

            /** @test {Switch.toWindow} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toWindow('new-tab').and().toString()).to.equal('#actor switches to window: new-tab')
            });
        });

        describe(`toNewWindow()`, () => {

            /** @test {Switch.toNewWindow} */
            it(`should complain if no new window has been opened`, () =>
                expect(actorCalled('Ventana').attemptsTo(
                    Navigate.to(page('Main window')),

                    Switch.toNewWindow(),
                )).to.be.rejectedWith(LogicError, `No new window has been opened to switch to`));

            /** @test {Switch.toNewWindow} */
            it('should switch to a newly opened window', () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(pageWithLinkToNewTab('Main window')),
                    Ensure.that(Text.of(h1), equals('Main window')),
                    Click.on(newTabLink),

                    Switch.toNewWindow(),
                    Ensure.that(Text.of(h1), equals('New tab')),
                ));

            /** @test {Switch.toNewWindow} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toNewWindow().toString()).to.equal('#actor switches to the new browser window')
            });
        });

        describe('toNewWindow().and()', () => {

            /** @test {Switch.toNewWindow} */
            it('should perform any activities in the context of the new window it switched to', () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(pageWithLinkToNewTab('Main window')),
                    Ensure.that(Text.of(h1), equals('Main window')),
                    Click.on(newTabLink),

                    Switch.toNewWindow().and(
                        Ensure.that(Text.of(h1), equals('New tab')),
                    ),
                    Ensure.that(Text.of(h1), equals('Main window')),
                ));

            /** @test {Switch.toNewWindow} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toNewWindow().and().toString()).to.equal('#actor switches to the new window')
            });
        });

        describe(`toOriginalWindow()`, function () {

            /** @test {Switch.toOriginalWindow} */
            it(`should not complain if it's already in the original window`, () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(page('Main window')),

                    Switch.toOriginalWindow(),
                    Ensure.that(Text.of(h1), equals('Main window')),
                ));

            /** @test {Switch.toOriginalWindow} */
            it('should switch back from a newly opened window', () =>
                actorCalled('Ventana').attemptsTo(
                    Navigate.to(pageWithLinkToNewTab('Main window')),
                    Ensure.that(Text.of(h1), equals('Main window')),
                    Click.on(newTabLink),

                    Switch.toNewWindow(),
                    Ensure.that(Text.of(h1), equals('New tab')),

                    Switch.toOriginalWindow(),
                    Ensure.that(Text.of(h1), equals('Main window')),
                ));

            /** @test {Switch.toOriginalWindow} */
            /** @test {Switch#toString} */
            it('should provide a sensible description of the interaction being performed', () => {
                expect(Switch.toOriginalWindow().toString()).to.equal('#actor switches back to the original browser window')
            });
        });
    });
});
