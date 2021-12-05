import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Navigate, PageElement, Value } from '@serenity-js/web';

describe('Value', () => {

    describe('of', () => {

        /** @test {Value} */
        /** @test {Value.of} */
        it('allows the actor to read the "value" attribute of a DOM element matching the locator', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/value/username_form.html'),

                Ensure.that(Value.of(PageElement.locatedByTagName('input').describedAs('username field')), equals('jan-molak')),
            ));

        /** @test {Value} */
        /** @test {Value#of} */
        it('allows the actor to read the "value" attribute of a DOM element matching the locator', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/value/username_form.html'),

                Ensure.that(Value.of(PageElement.locatedByTagName('input').describedAs('username field')), equals('jan-molak')),
            ));

        /** @test {Value} */
        /** @test {Value#of} */
        it('allows for a question relative to another target to be asked', () =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/value/username_form.html'),

                Ensure.that(
                    Value.of(PageElement.locatedByTagName('input').describedAs('username field'))
                        .of(PageElement.locatedByTagName('form').describedAs(`form`)),
                    equals('jan-molak'),
                ),
            ));
    });
});
