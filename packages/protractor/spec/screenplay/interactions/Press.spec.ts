import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { by, Key, protractor } from 'protractor';

import { BrowseTheWeb, Navigate, Press, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Press', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    const Form = {
        Text_Field:     Target.the('text field').located(by.name('text')),
    };

    // todo: add check.whether

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

        /** @test {Press} */
        /** @test {Press.the} */
        it('allows the actor to enter keys individually into a field', () => Bernie.attemptsTo(
            Navigate.to(page),

            Press.the('a').into(Form.Text_Field),
            Press.the('A').into(Form.Text_Field),

            Ensure.that(Value.of(Form.Text_Field), equals('aA')),
        ));

    });

    describe('keyboard shortcuts', function() {

        /** @test {Press} */
        /** @test {Press.the} */
        it('allows the actor to use keyboard shortcuts', () => Bernie.attemptsTo(
            Navigate.to(page),

            Press.the(Key.SHIFT, 'a').into(Form.Text_Field),

            Ensure.that(Value.of(Form.Text_Field), equals(`A`)),
        ));

    });

    given([
        {
            description: 'single key',
            interaction: Press.the('a').into(Form.Text_Field),
            expected:   `#actor types A in the text field`,
        },
        {
            description: 'sequence of keys',
            interaction: Press.the('a', 'b', 'c').into(Form.Text_Field),
            expected:   `#actor types A, B, C in the text field`,
        },
        {
            description: 'keyboard shortcut',
            interaction: Press.the(Key.CONTROL, 'a').into(Form.Text_Field),
            expected:   `#actor types Control-A in the text field`,
        },
        {
            description: 'complex shortcut',
            interaction: Press.the(Key.COMMAND, Key.ALT, 'a').into(Form.Text_Field),
            expected:   `#actor types Command-Alt-A in the text field`,
        },
    ]).
    /** @test {Press#toString} */
    it(`provides a sensible description of the interaction being performed`, ({ interaction, expected }) => {
        expect(interaction.toString()).to.equal(expected);
    });
});
