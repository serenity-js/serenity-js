/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { and, contain, Ensure, equals, not } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { By, Clear, Enter, Navigate, PageElement, Text, Value } from '@serenity-js/web';

import { EventMonitor } from '../../EventMonitor';

describe('Clear', () => {

    const Form = {
        field: PageElement.located(By.id('field')).describedAs('the input field'),
    };

    describe('when reporting', () => {
        it('correctly detects its invocation location', () => {
            const activity = Clear.theValueOf(Form.field);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Clear.spec.ts');
            expect(location.line).to.equal(19);
            expect(location.column).to.equal(36);
        });

        it('provides a sensible description of the interaction being performed', () => {
            expect(Clear.theValueOf(Form.field).toString())
                .to.equal('#actor clears the value of the input field');
        });
    });

    describe('when working with empty fields', () => {

        it('allows the actor to clear the value of an empty input', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/input_type_text.html'),

                Clear.theValueOf(Form.field),

                Ensure.that(Value.of(Form.field), equals('')),
            ));

        it('allows the actor to clear the value of an empty "contenteditable" element', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/contenteditable.html'),

                Clear.theValueOf(Form.field),

                Ensure.that(Text.of(Form.field), equals('')),
            ));

        it('does not affect elements with no "value" attribute', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/input_type_text.html'),

                Ensure.that(Value.of(Form.field), equals('')),

                Clear.theValueOf(Form.field),

                Ensure.that(Value.of(Form.field), equals('')),
            ));
    });

    describe('when working with non-clearable elements', () => {

        it('complains if the element cannot be cleared', () =>
            expect(
                actorCalled('Bernie').attemptsTo(
                    Navigate.to('/screenplay/interactions/clear/not_an_input_field.html'),

                    Clear.theValueOf(Form.field),
                ),
            ).to.be.rejectedWith(LogicError, `The input field doesn't seem like an element that could be cleared.`));
    });

    describe('when working with elements that can be cleared', () => {

        it('clears the value of an input field', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/input_type_text.html'),

                Enter.theValue('Hello').into(Form.field),
                EventMonitor.registerFor('field', [ 'keydown', 'blur' ]),

                Clear.theValueOf(Form.field),

                Ensure.that(Value.of(Form.field), equals('')),

                Ensure.that(EventMonitor.eventsRecordedFor('field'), and(
                    contain({ 'type': 'keydown', 'code': 'Delete', 'altKey': false, 'shiftKey': false, 'ctrlKey': false, 'metaKey': false }),
                    not(contain({ 'type': 'blur' }))
                )),
            ));

        it('allows the actor to clear the value of an number field', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/input_type_text.html'),

                Enter.theValue(42).into(Form.field),
                EventMonitor.registerFor('field', [ 'keydown', 'blur' ]),

                Clear.theValueOf(Form.field),

                Ensure.that(Value.of(Form.field), equals('')),

                Ensure.that(EventMonitor.eventsRecordedFor('field'), and(
                    contain({ 'type': 'keydown', 'code': 'Delete', 'altKey': false, 'shiftKey': false, 'ctrlKey': false, 'metaKey': false }),
                    not(contain({ 'type': 'blur' }))
                )),
            ));

        it('allows the actor to clear the value of a date field', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/input_type_date.html'),

                Enter.theValue('2022-10-06').into(Form.field),

                EventMonitor.registerFor('field', [ 'keydown', 'blur' ]),

                Clear.theValueOf(Form.field),

                Ensure.that(Value.of(Form.field), equals('')),

                Ensure.that(EventMonitor.eventsRecordedFor('field'), and(
                    contain({ 'type': 'keydown', 'code': 'Delete', 'altKey': false, 'shiftKey': false, 'ctrlKey': false, 'metaKey': false }),
                    not(contain({ 'type': 'blur' }))
                )),
            ));

        it('allows the actor to clear the value of an RTL input field', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/input_type_text_dir_rtl.html'),

                Enter.theValue('שלום עולם').into(Form.field),

                EventMonitor.registerFor('field', [ 'keydown', 'blur' ]),

                Clear.theValueOf(Form.field),

                Ensure.that(Value.of(Form.field), equals('')),

                Ensure.that(EventMonitor.eventsRecordedFor('field'), and(
                    contain({ 'type': 'keydown', 'code': 'Delete', 'altKey': false, 'shiftKey': false, 'ctrlKey': false, 'metaKey': false }),
                    not(contain({ 'type': 'blur' }))
                )),
            ));

        it('allows the actor to clear the value of an "contenteditable" element', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/interactions/clear/contenteditable.html'),

                Enter.theValue('Hello').into(Form.field),

                EventMonitor.registerFor('field', [ 'keydown', 'blur' ]),

                Clear.theValueOf(Form.field),

                Ensure.that(Text.of(Form.field).trim(), equals('')),

                Ensure.that(EventMonitor.eventsRecordedFor('field'), and(
                    contain({ 'type': 'keydown', 'code': 'Delete', 'altKey': false, 'shiftKey': false, 'ctrlKey': false, 'metaKey': false }),
                    not(contain({ 'type': 'blur' }))
                )),
            ));
    });
});
