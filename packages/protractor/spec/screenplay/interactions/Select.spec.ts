import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { by } from 'protractor';
import { Navigate, Select, Selected, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Select', () => {

    beforeEach(() => engage(new UIActors()));

    describe('when working with single-option selects', () => {

        const pageWithSingleSelect = pageFromTemplate(`
            <html>
                <body>
                <form>
                    <fieldset name='options'>
                        <legend>Working with single option</legend>
                        <label for='single-option-select'>
                            Country
                            <select id='single-option-select'>
                                <option label='United Kingdom' value='UK' selected='selected'>United Kingdom</option>
                                <option label='Poland' value='PL' selected='selected'>Poland</option>
                                <option label='Germany' value='DE' selected='selected'>Germany</option>
                                <option label='France' value='FR'>France</option>
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

        describe('Select.value', () => {

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

            describe('toString()', () => {

                /** @test {Select.value} */
                it('provides a sensible description of the interaction being performed', () => {
                    expect(Select.value('FR').from(SingleSelectPage.selector).toString())
                        .to.equal(`#actor selects value 'FR' in the country selector`);
                });

                /** @test {Selected.valueOf} */
                it('provides a sensible description of the question being answered', () => {
                    expect(Selected.valueOf(SingleSelectPage.selector).toString())
                        .to.equal(`value selected in the country selector`);
                });
            });
        });

        describe('Select.option', () => {

            /** @test {Select.option} */
            /** @test {Selected.optionOf} */
            it('should select a single option by its static name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithSingleSelect),
                    Select.option('France').from(SingleSelectPage.selector),
                    Ensure.that(Selected.optionOf(SingleSelectPage.selector), equals('France'))
                ));

            /** @test {Select.option} */
            /** @test {Selected.optionOf} */
            it('should select a single option by its Answerable name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithSingleSelect),
                    Select.option(Text.of(SingleSelectPage.countryName)).from(SingleSelectPage.selector),
                    Ensure.that(Selected.optionOf(SingleSelectPage.selector), equals('Poland'))
                ));
        });

        describe('toString()', () => {

            /** @test {Select.option} */
            it('provides a sensible description of the interaction being performed', () => {
                expect(Select.option('France').from(SingleSelectPage.selector).toString())
                    .to.equal(`#actor selects 'France' in the country selector`);
            });

            /** @test {Selected.optionOf} */
            it('provides a sensible description of the question being answered', () => {
                expect(Selected.optionOf(SingleSelectPage.selector).toString())
                    .to.equal(`option selected in the country selector`);
            });
        });
    });

    describe('when working with multi-option selects', () => {

        const pageWithMultiSelect = pageFromTemplate(`
            <html>
                <body>
                <form>
                    <fieldset name='options'>
                        <legend>Working with options</legend>
                        <label for='multi-option-select'>
                            Country
                            <select multiple='' id='multi-option-select'>
                                <option label='United Kingdom' value='UK'>United Kingdom</option>
                                <option label='Poland' value='PL'>Poland</option>
                                <option label='Germany' value='DE'>Germany</option>
                                <option label='France' value='FR'>France</option>
                            </select>
                        </label>
                    </fieldset>
                </form>
                <ul id='country-of-interest-codes'>
                    <li>PL</li>
                    <li>UK</li>
                </ul>
                <ul id='country-of-interest-names'>
                    <li>Poland</li>
                    <li>United Kingdom</li>
                </ul>
                </body>
            </html>
        `);

        class MultiSelectPage {
            static selector = Target.the('country selector').located(by.id('multi-option-select'));
            static countryCodes = Target.all('country codes').located(by.css('#country-of-interest-codes li'));
            static countryNames = Target.all('country names').located(by.css('#country-of-interest-names li'));
        }

        describe('Select.values', () => {

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should select multiple options by their static value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.values(['PL', 'DE']).from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['PL', 'DE']))
                ));

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should select multiple options by their Answerable value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.values(Text.ofAll(MultiSelectPage.countryCodes)).from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['UK', 'PL']))
                ));

            describe('toString()', () => {

                /** @test {Select.values} */
                it('provides a sensible description of the interaction being performed', () => {
                    expect(Select.values(['PL', 'DE']).from(MultiSelectPage.selector).toString())
                        .to.equal(`#actor selects values [ 'PL', 'DE' ] in the country selector`);
                });

                /** @test {Selected.valuesOf} */
                it('provides a sensible description of the question being answered', () => {
                    expect(Selected.valuesOf(MultiSelectPage.selector).toString())
                        .to.equal(`values selected in the country selector`);
                });
            });
        });

        describe('Select.options', () => {

            /** @test {Select.options} */
            /** @test {Selected.optionsOf} */
            it('should select multiple options by their static name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.options(['Poland', 'France']).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsOf(MultiSelectPage.selector), equals(['Poland', 'France']))));

            /** @test {Select.options} */
            /** @test {Selected.optionsOf} */
            it('should select multiple options by their Answerable name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.options(Text.ofAll(MultiSelectPage.countryNames)).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsOf(MultiSelectPage.selector), equals(['United Kingdom', 'Poland']))
                ));

            describe('toString()', () => {

                /** @test {Select.options} */
                it('provides a sensible description of the interaction being performed', () => {
                    expect(Select.options(['Poland', 'France']).from(MultiSelectPage.selector).toString())
                        .to.equal(`#actor selects [ 'Poland', 'France' ] in the country selector`);
                });

                /** @test {Selected.optionOf} */
                it('provides a sensible description of the question being answered', () => {
                    expect(Selected.optionsOf(MultiSelectPage.selector).toString())
                        .to.equal(`options selected in the country selector`);
                });
            });
        });
    });
});
