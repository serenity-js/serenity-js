import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { by } from 'protractor';

import { Navigate, RightClick, Target, Text } from '../../../src';
import { UIActors } from '../../UIActors';

/** @test {RightClick} */
describe('RightClick', () => {

    const Form = {
        InputField: Target.the('input field').located(by.css('#field')),
        Result: Target.the('result').located(by.css('#result'))
    };

    beforeEach(() => engage(new UIActors()));

    /** @test {RightClick.on} */
    it('allows the actor to click on an element', () => actorCalled('Bernie').attemptsTo(
        Navigate.to('/screenplay/interactions/right-click/example.html'),

        Ensure.that(Text.of(Form.Result), equals('')),
        RightClick.on(Form.InputField),
        Ensure.that(Text.of(Form.Result), equals('Test for right click.')),
    ));

    /** @test {RightClick#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(RightClick.on(Form.InputField).toString())
            .to.equal('#actor right clicks on the input field');
    });
});
