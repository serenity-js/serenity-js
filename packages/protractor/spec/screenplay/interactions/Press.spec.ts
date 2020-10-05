import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { by, Key } from 'protractor';

import { Navigate, Press, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

/** @test {Press} */
describe('Press', () => {

    const Form = {
        Text_Field:     Target.the('text field').located(by.name('text')),
    };

    const page = pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" name="text" />
                    </form>
                </body>
            </html>
        `);

    describe('single keys', () => {

        /** @test {Press.the} */
        it('allows the actor to enter keys individually into a field', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(page),

            Press.the('a').in(Form.Text_Field),
            Press.the('A').in(Form.Text_Field),

            Ensure.that(Value.of(Form.Text_Field), equals('aA')),
        ));

    });

    describe('keyboard shortcuts', function () {

        /** @test {Press.the} */
        it('allows the actor to use keyboard shortcuts', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(page),

            Press.the(Key.SHIFT, 'a').in(Form.Text_Field),

            Ensure.that(Value.of(Form.Text_Field), equals(`A`)),
        ));
    });

    given([
        {
            description: 'single key',
            interaction: Press.the('a').in(Form.Text_Field),
            expected:   `#actor presses A in the text field`,
        },
        {
            description: 'sequence of keys',
            interaction: Press.the('a', 'b', 'c').in(Form.Text_Field),
            expected:   `#actor presses A, B, C in the text field`,
        },
        {
            description: 'keyboard shortcut',
            interaction: Press.the(Key.CONTROL, 'a').in(Form.Text_Field),
            expected:   `#actor presses Control-A in the text field`,
        },
        {
            description: 'complex shortcut',
            interaction: Press.the(Key.COMMAND, Key.ALT, 'a').in(Form.Text_Field),
            expected:   `#actor presses Command-Alt-A in the text field`,
        },
    ]).
    /** @test {Press#toString} */
    it('provides a sensible description of the interaction being performed', ({ interaction, expected }) => {
        expect(interaction.toString()).to.equal(expected);
    });
});
