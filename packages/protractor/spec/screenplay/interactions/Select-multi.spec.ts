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

    const pageWithMultiSelect = pageFromTemplate(`
            <html>
                <body>
                <form>
                    <fieldset name='options'>
                        <legend>Working with options</legend>
                        <label for='multi-option-select'>
                            Country
                            <select multiple id='multi-option-select'>
                                <option value='UK'>United Kingdom</option>
                                <option value='PL'>Poland</option>
                                <option value='DE'>Germany</option>
                                <option value='FR'>France</option>
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
                <p id='another-country-of-interest-code'>DE</p>
                <p id='another-country-of-interest-name'>Germany</p>
                </body>
            </html>
        `);

    class MultiSelectPage {
        static selector = Target.the('country selector').located(by.id('multi-option-select'));
        static countryCodes = Target.all('country codes').located(by.css('#country-of-interest-codes li'));
        static countryNames = Target.all('country names').located(by.css('#country-of-interest-names li'));
        static anotherCountryCode = Target.the('another country code').located(by.css('#another-country-of-interest-code'));
        static anotherCountryName = Target.the('another country name').located(by.css('#another-country-of-interest-name'));
    }

    beforeEach(() => engage(new UIActors()));

    describe('when working with multi-option selects', () => {

        describe('Select.values()', () => {

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should select multiple options by their static value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.values('PL', 'DE').from(MultiSelectPage.selector),
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

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should concatenate option values from several Answerables', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.values(
                        Text.ofAll(MultiSelectPage.countryCodes),
                        Text.of(MultiSelectPage.anotherCountryCode),
                        'FR'
                    ).from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['UK', 'PL', 'DE', 'FR']))
                ));

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should concatenate option values from several static values', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.values('UK', 'PL').from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['UK', 'PL']))
                ));
        });

        describe('Select.options()', () => {

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should select multiple options by their static name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.options(['Poland', 'France']).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['Poland', 'France']))));

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should select multiple options by their Answerable name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.options(Text.ofAll(MultiSelectPage.countryNames)).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['United Kingdom', 'Poland']))
                ));

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should concatenate option values from several Answerables', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.options(
                        Text.ofAll(MultiSelectPage.countryNames),
                        Text.of(MultiSelectPage.anotherCountryName),
                        'France'
                    ).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['United Kingdom', 'Poland', 'Germany', 'France']))
                ));

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should concatenate option values from several static values', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to(pageWithMultiSelect),
                    Select.options(['Poland', 'Germany'], 'France').from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['Poland', 'Germany', 'France']))
                ));
        });
    });

    describe('toString()', () => {

        /** @test {Select.values} */
        /** @test {Select#toString} */
        it('provides a sensible description of Select.values()', () => {
            expect(Select.values(['PL', 'DE'], 'FR').from(MultiSelectPage.selector).toString())
                .to.equal(`#actor selects values 'PL', 'DE' and 'FR' from the country selector`);
        });

        /** @test {Selected.valuesOf} */
        /** @test {Select#toString} */
        it('provides a sensible description of Select.valuesOf()', () => {
            expect(Selected.valuesOf(MultiSelectPage.selector).toString())
                .to.equal(`values selected in the country selector`);
        });

        /** @test {Select.options} */
        /** @test {Select#toString} */
        it('provides a sensible description of Select.options()', () => {
            expect(
                Select.options(
                    ['Poland', 'Germany' ],
                    'France',
                    Text.of(MultiSelectPage.anotherCountryName)
                ).from(MultiSelectPage.selector).toString()
            ).to.equal(`#actor selects 'Poland', 'Germany', 'France' and the text of the another country name from the country selector`);
        });

        /** @test {Selected.optionsIn} */
        /** @test {Select#toString} */
        it('provides a sensible description of Selected.optionsIn()', () => {
            expect(Selected.optionsIn(MultiSelectPage.selector).toString())
                .to.equal(`options selected in the country selector`);
        });
    });
});
