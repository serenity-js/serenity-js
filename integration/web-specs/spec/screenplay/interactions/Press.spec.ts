import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, notes, Wait } from '@serenity-js/core';
import { Attribute, By, isVisible, Key, Navigate, PageElement, Press, Text, Value } from '@serenity-js/web';
import { given } from 'mocha-testdata';

describe('Press', () => {

    const InputBoxForm = {
        textField: PageElement.located(By.id('input-box')).describedAs('the text field'),
    };

    const KeyEventLoggerForm = {
        input:  PageElement.located(By.id('input')).describedAs('input'),
        output: PageElement.located(By.id('output')).describedAs('output'),
    }

    describe('single keys', () => {

        it('allows the actor to enter keys individually into a field', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/input_box.html'),

                Press.the('a').in(InputBoxForm.textField),
                Press.the('A').in(InputBoxForm.textField),

                Ensure.that(Value.of(InputBoxForm.textField), equals('aA')),
            ));
    });

    describe('key chords', function () {

        it('allows the actor to use keyboard shortcuts in the context of the currently focused input box', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/key_event_logger.html'),

                Wait.until(KeyEventLoggerForm.input, isVisible()),

                Ensure.eventually(Attribute.called('data-event-handled').of(KeyEventLoggerForm.input), equals('false')),

                Press.the(Key.Tab),
                Press.the(Key.Control, 'b'),

                Wait.until(Attribute.called('data-event-handled').of(KeyEventLoggerForm.input), equals('true')),

                notes<MyNotes>().set('event', Text.of(KeyEventLoggerForm.output).as(eventDetailsFromJson)),

                Ensure.that(notes<MyNotes>().get('event').key, equals('b')),
                Ensure.that(notes<MyNotes>().get('event').ctrlKey, equals(true)),
            ));

        it('allows the actor to use keyboard shortcuts in the context of a specific input box', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/press/key_event_logger.html'),

                Wait.until(KeyEventLoggerForm.input, isVisible()),

                Ensure.eventually(Attribute.called('data-event-handled').of(KeyEventLoggerForm.input), equals('false')),

                Press.the(Key.Control, 'b').in(KeyEventLoggerForm.input),

                Wait.until(Attribute.called('data-event-handled').of(KeyEventLoggerForm.input), equals('true')),

                notes<MyNotes>().set('event', Text.of(KeyEventLoggerForm.output).as(eventDetailsFromJson)),

                Ensure.that(notes<MyNotes>().get('event').key, equals('b')),
                Ensure.that(notes<MyNotes>().get('event').ctrlKey, equals(true)),
            ));
    });

    given([
        {
            description: 'single key, document context',
            interaction: Press.the('a'),
            expected: `#actor presses key a`,
        },
        {
            description: 'single key, element context',
            interaction: Press.the('a').in(InputBoxForm.textField),
            expected: `#actor presses key a in the text field`,
        },
        {
            description: 'sequence of keys, document context',
            interaction: Press.the('a', 'b', 'c'),
            expected: `#actor presses keys a, b, c`,
        },
        {
            description: 'sequence of keys, element context',
            interaction: Press.the('a', 'b', 'c').in(InputBoxForm.textField),
            expected: `#actor presses keys a, b, c in the text field`,
        },
        {
            description: 'keyboard shortcut, document context',
            interaction: Press.the(Key.Meta, 'a'),
            expected: `#actor presses keys Meta-a`,
        },
        {
            description: 'keyboard shortcut, element context',
            interaction: Press.the(Key.Meta, 'a').in(InputBoxForm.textField),
            expected: `#actor presses keys Meta-a in the text field`,
        },
        {
            description: 'complex shortcut, document context',
            interaction: Press.the(Key.Meta, Key.Alt, 'a'),
            expected: `#actor presses keys Meta-Alt-a`,
        },
        {
            description: 'complex shortcut, element context',
            interaction: Press.the(Key.Meta, Key.Alt, 'a').in(InputBoxForm.textField),
            expected: `#actor presses keys Meta-Alt-a in the text field`,
        },
    ]).
    it('provides a sensible description of the interaction being performed', ({ interaction, expected }) => {
        expect(interaction.toString()).to.equal(expected);
    });

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = Press.the('a');
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Press.spec.ts');
            expect(location.line).to.equal(121);
            expect(location.column).to.equal(36);
        });

        it('correctly detects its invocation location when custom errors are used', () => {
            const activity = Press.the('a').in(InputBoxForm.textField);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Press.spec.ts');
            expect(location.line).to.equal(130);
            expect(location.column).to.equal(47);
        });
    });
});

interface EventDetails {
    key:      string;
    keyCode:  number;
    ctrlKey:  boolean;
    altKey:   boolean;
    shiftKey: boolean;
    metaKey:  boolean;
}

interface MyNotes {
    event: EventDetails;
}

function eventDetailsFromJson(text: string): EventDetails {
    return JSON.parse(text);
}
