import { expect, stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';

import { by } from 'protractor';
import { Clear, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Clear', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    const Form = {
        Field: Target.the('input field').located(by.id('field')),
    };

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an input field', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" id="field" value="Jan" />
                    </form>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an number field', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="number" id="field" value="42" >
                    </form>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of a date field', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="date" id="field" value="2019-09-22" />
                    </form>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an RTL input field', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html dir="rtl">
                <body>
                    <form>
                        <input type="text" id="field" value="שלום עולם" dir="rtl" />
                    </form>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Clear.theValueOf(Form.Field).toString())
            .to.equal('#actor clears the value of the input field');
    });
});
