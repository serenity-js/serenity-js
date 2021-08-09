import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage, LogicError } from '@serenity-js/core';
import { by } from 'protractor';

import { Clear, Navigate, Target, Value } from '../../../src';
import { UIActors } from '../../UIActors';

describe('Clear', () => {

    const Form = {
        Field: Target.the('input field').located(by.id('field')),
    };

    beforeEach(() => engage(new UIActors()));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an empty input', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/clear/empty_input_field.html'),

            Clear.theValueOf(Form.Field),

            Ensure.that(Value.of(Form.Field), equals('')),
        ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('does not affect elements with no "value" attribute', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/clear/input_field_with_no_value.html'),

            Ensure.that(Value.of(Form.Field), equals('')),

            Clear.theValueOf(Form.Field),

            Ensure.that(Value.of(Form.Field), equals('')),
        ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an input field', () => actorCalled('Bernie').attemptsTo(
        Navigate.to('/screenplay/interactions/clear/input_field_with_value.html'),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an number field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/clear/number_input_field_with_value.html'),

            Clear.theValueOf(Form.Field),

            Ensure.that(Value.of(Form.Field), equals('')),
        ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of a date field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/clear/date_input_field_with_value.html'),

            Clear.theValueOf(Form.Field),

            Ensure.that(Value.of(Form.Field), equals('')),
        ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an RTL input field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/clear/input_field_with_value_rtl.html'),

            Clear.theValueOf(Form.Field),

            Ensure.that(Value.of(Form.Field), equals('')),
        ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('complains if the element cannot be cleared', () =>
        expect(actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/clear/not_an_input_field.html'),

            Clear.theValueOf(Form.Field),
        )).to.be.rejectedWith(LogicError, `The input field doesn't seem to have a 'value' attribute that could be cleared.`));

    /** @test {Clear#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Clear.theValueOf(Form.Field).toString())
            .to.equal('#actor clears the value of the input field');
    });
});
