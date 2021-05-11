/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';

import { by } from 'protractor';
import { Click, Close, Navigate, Switch, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

/** @test {Close} */
describe('Close', () => {

    const
        h1 = Target.the('header').located(by.css('h1')),
        newTabLink = Target.the('link').located(by.linkText('open new tab'));

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

    describe('anyNewWindows()', () => {

        /** @test {Close.anyNewWindows} */
        it('should close any new windows and switch back to the original window', () =>
            actorCalled('Caleb').attemptsTo(
                Navigate.to(pageWithLinkToNewTab('Main page')),
                Click.on(newTabLink),

                Switch.toNewWindow(),
                Ensure.that(Text.of(h1), equals('New tab')),

                Close.anyNewWindows(),

                Ensure.that(Text.of(h1), equals('Main page')),
            ));

        /** @test {Close.anyNewWindows} */
        it('should do nothing if no new windows have been opened', () =>
            actorCalled('Caleb').attemptsTo(
                Navigate.to(pageWithLinkToNewTab('Main page')),

                Close.anyNewWindows(),

                Ensure.that(Text.of(h1), equals('Main page')),
            ));

        /** @test {Close.anyNewWindows} */
        /** @test {Close#toString} */
        it('should provide a sensible description of the interaction being performed', () => {
            expect(Close.anyNewWindows().toString()).to.equal('#actor closes any new windows')
        });
    });

    describe('currentWindow()', () => {

        /** @test {Close.currentWindow} */
        it('should close the current window', () =>
            actorCalled('Caleb').attemptsTo(
                Navigate.to(pageWithLinkToNewTab('Main page')),
                Click.on(newTabLink),

                Switch.toNewWindow(),
                Ensure.that(Text.of(h1), equals('New tab')),

                Close.currentWindow(),
                Switch.toOriginalWindow(),

                Ensure.that(Text.of(h1), equals('Main page')),
            ));

        /** @test {Close.currentWindow} */
        /** @test {Close#toString} */
        it('should provide a sensible description of the interaction being performed', () => {
            expect(Close.currentWindow().toString()).to.equal('#actor closes current browser window')
        });
    });
});
