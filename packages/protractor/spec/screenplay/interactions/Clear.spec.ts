import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage, LogicError } from '@serenity-js/core';

import { by } from 'protractor';
import { Clear, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Clear', () => {

    const Form = {
        Field: Target.the('input field').located(by.id('field')),
    };

    beforeEach(() => engage(new UIActors()));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an empty input with no "value" attribute', () => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" id="field" value="" />
                    </form>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('does not affect elements with no "value" attribute', () => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" id="field" />
                    </form>
                </body>
            </html>
        `)),

        Ensure.that(Value.of(Form.Field), equals('')),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('allows the actor to clear the value of an input field', () => actorCalled('Bernie').attemptsTo(
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
    it('allows the actor to clear the value of an number field', () => actorCalled('Bernie').attemptsTo(
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
    it('allows the actor to clear the value of a date field', () => actorCalled('Bernie').attemptsTo(
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
    it('allows the actor to clear the value of an RTL input field', () => actorCalled('Bernie').attemptsTo(
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

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
    it('complains if the element cannot be cleared', () => expect(actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html dir="rtl">
                <body>
                    <div id="field">Hello World!</div>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),
    )).to.be.rejectedWith(LogicError, `The input field doesn't seem to have a 'value' attribute that could be cleared.`));

    /** @test {Clear#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Clear.theValueOf(Form.Field).toString())
            .to.equal('#actor clears the value of the input field');
    });
});
