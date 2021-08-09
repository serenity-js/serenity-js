import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { by, Navigate, RightClick, Target, Text} from '../../../src';

/** @test {RightClick} */
describe('RightClick', () => {

    const Form = {
        inputField: Target.the('input field').located(by.css('#field')),
        result: Target.the('result').located(by.css('#result'))
    };

    /** @test {RightClick.on} */
    it('allows the actor to click on an element', () => actorCalled('Bernie').attemptsTo(
        Navigate.to('/screenplay/interactions/right-click/example.html'),

        Ensure.that(Text.of(Form.result), equals('')),
        RightClick.on(Form.inputField),
        Ensure.that(Text.of(Form.result), equals('Test for right click.')),
    ));

    /** @test {RightClick#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(RightClick.on(Form.inputField).toString())
            .to.equal('#actor right-clicks on the input field');
    });
});
