import 'mocha';
import { expect } from '@integration/testing-tools';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Note, TakeNote } from '@serenity-js/core';
import { ResizeBrowserWindow, Window } from '../../../src';

/** @test {ResizeBrowserWindow} */
describe('ResizeBrowserWindow', () => {

    describe(`to()`, () => {

        /** @test {ResizeBrowserWindow.to} */
        it('allows the actor to change width and height of the browser window', () =>
            actorCalled('Nick').attemptsTo(
                ResizeBrowserWindow.to(640, 480),
                Ensure.that(Window.size(), equals({width: 640, height: 480})),
                ResizeBrowserWindow.to(480, 640),
                Ensure.that(Window.size(), equals({width: 480, height: 640})),
            ));

        /** @test {ResizeBrowserWindow.to} */
        /** @test {ResizeBrowserWindow#toString} */
        it('produces a sensible description of the interaction being performed', () => {
            expect(ResizeBrowserWindow.to(640, 480).toString()).equals('#actor sets the size of the browser window to 640 x 480');
        });
    });

    describe('toMaximum()', () => {

        /** @test {ResizeBrowserWindow.toMaximum} */
        it('allows the actor to resize browser window to maximum', () =>
            actorCalled('Nick').attemptsTo(
                ResizeBrowserWindow.toMaximum(),
                TakeNote.of(Window.size()),
                ResizeBrowserWindow.to(480, 640),
                ResizeBrowserWindow.toMaximum(),
                Ensure.that(Note.of(Window.size()), equals(Window.size())),
            ));

        /** @test {ResizeBrowserWindow.toMaximum} */
        /** @test {ResizeBrowserWindow#toString} */
        it('produces a sensible description of the interaction being performed', () => {
            expect(ResizeBrowserWindow.toMaximum().toString()).equals('#actor maximises the browser window');
        });
    });
});
