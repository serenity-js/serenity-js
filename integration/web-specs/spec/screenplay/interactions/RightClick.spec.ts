import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, notes, Wait } from '@serenity-js/core';
import { By, isVisible, Navigate, PageElement, RightClick, Text } from '@serenity-js/web';

describe('RightClick', () => {

    const MouseEventLoggerForm = {
        input: PageElement.located(By.id('input')).describedAs('input'),
        output: PageElement.located(By.id('output')).describedAs('output'),
    }

    it('allows the actor to right-click on an element', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/right-click/mouse_event_logger.html'),

            Wait.until(MouseEventLoggerForm.input, isVisible()),

            RightClick.on(MouseEventLoggerForm.input),

            notes<MyNotes>().set('event', Text.of(MouseEventLoggerForm.output).as(eventDetailsFromJson)),

            Ensure.that(notes<MyNotes>().get('event').event, equals('contextmenu')),
            Ensure.that(notes<MyNotes>().get('event').button, equals(2)),
            Ensure.that(notes<MyNotes>().get('event').receiver, equals('input')),
        ));

    it('provides a sensible description of the interaction being performed', () => {
        expect(RightClick.on(MouseEventLoggerForm.input).toString())
            .to.equal('#actor right-clicks on input');
    });

    it('correctly detects its invocation location', () => {
        const activity = RightClick.on(MouseEventLoggerForm.input);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('RightClick.spec.ts');
        expect(location.line).to.equal(36);
        expect(location.column).to.equal(37);
    });
});

interface EventDetails {
    button: number;
    event: string;
    receiver: 'input';
    position: { x: number, y: number };
}

interface MyNotes {
    event: EventDetails;
}

function eventDetailsFromJson(text: string): EventDetails {
    return JSON.parse(text);
}
