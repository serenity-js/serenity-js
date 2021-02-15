import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { by } from 'protractor';
import { Navigate, Select, Selected, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

/** @test {Select} */
describe('Select', () => {

    const pageWithSingleSelect = pageFromTemplate(`
            <html>
                <body>
                <form>
                    <fieldset name='options'>
                        <legend>Working with single option</legend>
                        <label for='single-option-select'>
                            Country
                            <select id='single-option-select'>
                                <option value='UK'>United Kingdom</option>
                                <option value='PL'>Poland</option>
                                <option value='DE'>Germany</option>
                                <option value='FR'>France</option>
                            </select>
                        </label>
                    </fieldset>
                    <p id='country-of-interest-code'>PL</p>
                    <p id='country-of-interest-name'>Poland</p>
                </form>
                </body>
            </html>
        `);

    class SingleSelectPage {
        static selector = Target.the('country selector').located(by.id('single-option-select'));
        static countryCode = Target.the('country code').located(by.id('country-of-interest-code'));
        static countryName = Target.the('country name').located(by.id('country-of-interest-name'));
    }

    beforeEach(() => engage(new UIActors()));

    describe('when working with single-option selects', () => {

        describe('Select.value()', () => {

            /** @test {Select.value} */
            /** @test {Selected.valueOf} */
            it('should select a single option by its static value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithSingleSelect),
                    Select.value('FR').from(SingleSelectPage.selector),
                    Ensure.that(Selected.valueOf(SingleSelectPage.selector), equals('FR'))
                ));

            /** @test {Select.value} */
            /** @test {Selected.valueOf} */
            it('should select a single option by its Answerable value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithSingleSelect),
                    Select.value(Text.of(SingleSelectPage.countryCode)).from(SingleSelectPage.selector),
                    Ensure.that(Selected.valueOf(SingleSelectPage.selector), equals('PL'))
                ));
        });

        describe('Select.option()', () => {

            /** @test {Select.option} */
            /** @test {Selected.optionIn} */
            it('should select a single option by its static name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithSingleSelect),
                    Select.option('France').from(SingleSelectPage.selector),
                    Ensure.that(Selected.optionIn(SingleSelectPage.selector), equals('France'))
                ));

            /** @test {Select.option} */
            /** @test {Selected.optionIn} */
            it('should select a single option by its Answerable name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithSingleSelect),
                    Select.option(Text.of(SingleSelectPage.countryName)).from(SingleSelectPage.selector),
                    Ensure.that(Selected.optionIn(SingleSelectPage.selector), equals('Poland'))
                ));
        });
    });

    describe('toString()', () => {

        /** @test {Select.value} */
        /** @test {Select#toString} */
        it('provides a sensible description of Select.value()', () => {
            expect(Select.value('FR').from(SingleSelectPage.selector).toString())
                .to.equal(`#actor selects value 'FR' from the country selector`);
        });

        /** @test {Selected.valueOf} */
        /** @test {Select#toString} */
        it('provides a sensible description of Selected.valueOf', () => {
            expect(Selected.valueOf(SingleSelectPage.selector).toString())
                .to.equal(`value selected in the country selector`);
        });

        /** @test {Select.option} */
        /** @test {Select#toString} */
        it('provides a sensible description of Select.option()', () => {
            expect(Select.option('France').from(SingleSelectPage.selector).toString())
                .to.equal(`#actor selects 'France' from the country selector`);
        });

        /** @test {Selected.optionIn} */
        /** @test {Select#toString} */
        it('provides a sensible description of Selected.optionIn()', () => {
            expect(Selected.optionIn(SingleSelectPage.selector).toString())
                .to.equal(`option selected in the country selector`);
        });
    });
});
