import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Note, TakeNote } from '@serenity-js/core';
import { ResizeBrowserWindow, Window } from '../../../src';

describe('ResizeBrowserWindow', () => {

    /** @test {ResizeBrowserWindow} */
    /** @test {ResizeBrowserWindow.to} */
    it('allows the actor to change width and height of browser window', () => actorCalled('Nick').attemptsTo(
        ResizeBrowserWindow.to(640, 480),
        Ensure.that(Window.size(), equals({width: 640, height: 480})),
        ResizeBrowserWindow.to(480, 640),
        Ensure.that(Window.size(), equals({width: 480, height: 640})),
    ));

    /** @test {ResizeBrowserWindow.toMaximum} */
    it('allows the actor to resize browser window to maximum', () => actorCalled('Nick').attemptsTo(
        ResizeBrowserWindow.toMaximum(),
        TakeNote.of(Window.size()),
        ResizeBrowserWindow.to(480, 640),
        ResizeBrowserWindow.toMaximum(),
        Ensure.that(Note.of(Window.size()), equals(Window.size())),
    ));
});
