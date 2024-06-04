import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Masked, Question } from '@serenity-js/core';
import { By, Enter, Navigate, PageElement, Value } from '@serenity-js/web';
import { given } from 'mocha-testdata';

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

    it('correctly detects its invocation location', () => {
        const activity = Enter.theValue(actorCalled('Bernie').name).into(Form.field);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Enter.spec.ts');
        expect(location.line).to.equal(40);
        expect(location.column).to.equal(69);
    });

    describe('when generating a description', () => {

        describe('toString', () => {

            given([
                { description: 'string',    value: 'some text',                                 expected: '#actor enters "some text" into the name field' },
                { description: 'number',    value: 42,                                          expected: '#actor enters 42 into the name field' },
                { description: 'promise',   value: Promise.resolve('text'),                     expected: '#actor enters Promise into the name field' },
                { description: 'Question',  value: Question.about('value', actor => 'text'),    expected: '#actor enters value into the name field' },
            ]).
            it('includes a description of the parameter', ({ value, expected }) => {
                const enter = Enter.theValue(value)
                    .into(Form.field);

                expect(enter.toString()).to.equal(expected);
            });

            given([
                {
                    description: 'string[]',
                    value: [ 'some', 'text' ],
                    expected: '#actor enters [ "some", "text" ] into the name field'
                },
                {
                    description: 'number[]',
                    value: [ 4, 2 ],
                    expected: '#actor enters [ 4, 2 ] into the name field'
                },
                {
                    description: 'promise[]',
                    value: [ Promise.resolve('text'), Promise.resolve(1) ],
                    expected: '#actor enters [ Promise, Promise ] into the name field'
                },
                {
                    description: 'Question[]',
                    value: [
                        Question.about('value1', actor => 'text'),
                        Question.about('value2', actor => 'text')
                    ],
                    expected: '#actor enters [ value1, value2 ] into the name field'
                },
            ]).
            it('includes a description of multiple parameters', ({ value, expected }) => {
                const enter = Enter.theValue(...value)
                    .into(Form.field);

                expect(enter.toString()).to.equal(expected);
            });

            it('masks the parameter when required', () => {
                const enter = Enter.theValue(Masked.valueOf(actorCalled('Bernie').name))
                    .into(Form.field);

                expect(enter.toString())
                    .to.equal(`#actor enters [MASKED] into the name field`);
            });
        });

        describe('describedBy', () => {
            given([
                {
                    description: 'string',
                    value: 'some text',
                    expected: '#actor enters "some text" into the name field'
                },
                {
                    description: 'number',
                    value: 42,
                    expected: '#actor enters 42 into the name field'
                },
                {
                    description: 'promise',
                    value: Promise.resolve('text'),
                    expected: '#actor enters "text" into the name field'
                },
                {
                    description: 'Question',
                    value: Question.about('value', actor => 'text').describedAs(Question.description().of(Question.value())),
                    expected: '#actor enters "text" into the name field'
                },
            ]).
            it('includes the value of the parameter', async ({ value, expected }) => {
                const enter = Enter.theValue(value)
                    .into(Form.field);

                const description = await enter.describedBy(actorCalled('Bernie'))

                expect(description.value).to.equal(expected);
            });

            it('ONLY includes the value of the parameter', async () => {
                const value = [
                    Question.about('value1', actor => 'text1').describedAs(Question.description().of(Question.value())),
                    Question.about('value2', actor => 'text2'),
                    Question.about('value3', actor => 42).describedAs(Question.description().of(Question.value())),
                ];
                const expected = '#actor enters [ "text1", value2, 42 ] into the name field'

                const enter = Enter.theValue(...value)
                    .into(Form.field);

                const Bernie = actorCalled('Bernie');

                const description = await enter.describedBy(Bernie)

                expect(description.value).to.equal(expected);
            });

            given([
                {
                    description: 'string[]',
                    value: [ 'some', 'text' ],
                    expected: '#actor enters [ "some", "text" ] into the name field'
                },
                {
                    description: 'number[]',
                    value: [ 4, 2 ],
                    expected: '#actor enters [ 4, 2 ] into the name field'
                },
                {
                    description: 'promise[]',
                    value: [ Promise.resolve('text'), Promise.resolve(1) ],
                    expected: '#actor enters [ "text", 1 ] into the name field'
                },
                {
                    description: 'Question[]',
                    value: [
                        Question.about('value1', actor => 'text1').describedAs(Question.description().of(Question.value())),
                        Question.about('value2', actor => 'text2'),
                        Question.about('value3', actor => 42).describedAs(Question.description().of(Question.value())),
                    ],
                    expected: '#actor enters [ "text1", value2, 42 ] into the name field'
                },
            ]).
            it('includes a description of multiple parameters', async ({ value, expected }) => {
                const enter = Enter.theValue(...value)
                    .into(Form.field);

                const description = await enter.describedBy(actorCalled('Bernie'))

                expect(description.value).to.equal(expected);
            });

            it('masks the parameter when required', async () => {
                const enter = Enter.theValue(Masked.valueOf(actorCalled('Bernie').name))
                    .into(Form.field);

                const description = await enter.describedBy(actorCalled('Bernie'))

                expect(description.value)
                    .to.equal(`#actor enters [MASKED] into the name field`);
            });
        });
    });
});
