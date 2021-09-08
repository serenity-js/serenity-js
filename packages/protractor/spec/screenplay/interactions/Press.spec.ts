import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { by, Key, Navigate, Press, Target, Value } from '@serenity-js/web';
import { given } from 'mocha-testdata';

import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

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

    beforeEach(() => engage(new UIActors()));

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

            Press.the(Key.Shift, 'a').in(Form.Text_Field),

            Ensure.that(Value.of(Form.Text_Field), equals(`A`)),
        ));
    });

    given([
        {
            description: 'single key',
            interaction: Press.the('a').in(Form.Text_Field),
            expected:   `#actor presses key a in the text field`,
        },
        {
            description: 'sequence of keys',
            interaction: Press.the('a', 'b', 'c').in(Form.Text_Field),
            expected:   `#actor presses keys a, b, c in the text field`,
        },
        {
            description: 'keyboard shortcut',
            interaction: Press.the(Key.Control, 'a').in(Form.Text_Field),
            expected:   `#actor presses keys Control-a in the text field`,
        },
        {
            description: 'complex shortcut',
            interaction: Press.the(Key.Meta, Key.Alt, 'a').in(Form.Text_Field),
            expected:   `#actor presses keys Meta-Alt-a in the text field`,
        },
    ]).
    /** @test {Press#toString} */
    it('provides a sensible description of the interaction being performed', ({ interaction, expected }) => {
        expect(interaction.toString()).to.equal(expected);
    });
});
