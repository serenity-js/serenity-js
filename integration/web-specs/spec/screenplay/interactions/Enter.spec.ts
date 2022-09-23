import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, Enter, Navigate, PageElement, Value } from '@serenity-js/web';

/** @test {Enter} */
describe('Enter', () => {

    const Form = {
        field:  PageElement.located(By.id('field')).describedAs('the name field'),
        result: PageElement.located(By.id('result')).describedAs('result'),
    };

    /** @test {Enter} */
    /** @test {Enter.theValue} */
    it('allows the actor to enter the value into an input field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/enter/text_copier.html'),

            Enter.theValue(actorCalled('Bernie').name).into(Form.field),

            Ensure.that(Value.of(Form.field), equals(actorCalled('Bernie').name)),
        ));

    /** @test {Enter} */
    /** @test {Enter.theValue} */
    it('allows the actor to enter a sequence of keys into a number field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/enter/text_copier.html'),

            Enter.theValue('1', ['2', '3']).into(Form.field),

            Ensure.that(Value.of(Form.field), equals('123')),
        ));

    /** @test {Enter#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Enter.theValue(actorCalled('Bernie').name).into(Form.field).toString())
            .to.equal(`#actor enters 'Bernie' into the name field`);
    });

    it('correctly detects its invocation location', () => {
        const activity = Enter.theValue(actorCalled('Bernie').name).into(Form.field);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Enter.spec.ts');
        expect(location.line).to.equal(45);
        expect(location.column).to.equal(69);
    });
});
