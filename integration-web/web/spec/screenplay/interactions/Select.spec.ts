import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { by, Navigate, Select, Selected, Target, Text } from '@serenity-js/web';

/** @test {Select} */
describe('Select', () => {

    class SingleSelectPage {
        static pageName = 'single-select';
        static selector = Target.the('country selector').located(by.id('single-option-select'));
        static countryCode = Target.the('country code').located(by.id('country-of-interest-code'));
        static countryName = Target.the('country name').located(by.id('country-of-interest-name'));
    }

    class MultiSelectPage {
        static pageName = 'multi-select';
        static selector = Target.the('country selector').located(by.id('multi-option-select'));
        static countryCodes = Target.all('country codes').located(by.css('#country-of-interest-codes li'));
        static countryNames = Target.all('country names').located(by.css('#country-of-interest-names li'));
        static anotherCountryCode = Target.the('another country code').located(by.css('#another-country-of-interest-code'));
        static anotherCountryName = Target.the('another country name').located(by.css('#another-country-of-interest-name'));
    }

    describe.skip('when working with single-option selects', () => {

        describe('Select.value()', () => {

            /** @test {Select.value} */
            /** @test {Selected.valueOf} */
            it('should select a single option by its static value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/single_select.html'),
                    Select.value('FR').from(SingleSelectPage.selector),
                    Ensure.that(Selected.valueOf(SingleSelectPage.selector), equals('FR'))
                ));

            /** @test {Select.value} */
            /** @test {Selected.valueOf} */
            it('should select a single option by its Answerable value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/single_select.html'),
                    Select.value(Text.of(SingleSelectPage.countryCode)).from(SingleSelectPage.selector),
                    Ensure.that(Selected.valueOf(SingleSelectPage.selector), equals('PL'))
                ));
        });

        describe('Select.option()', () => {

            /** @test {Select.option} */
            /** @test {Selected.optionIn} */
            it('should select a single option by its static pageName', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/single_select.html'),
                    Select.option('France').from(SingleSelectPage.selector),
                    Ensure.that(Selected.optionIn(SingleSelectPage.selector), equals('France'))
                ));

            /** @test {Select.option} */
            /** @test {Selected.optionIn} */
            it('should select a single option by its Answerable name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/single_select.html'),
                    Select.option(Text.of(SingleSelectPage.countryName)).from(SingleSelectPage.selector),
                    Ensure.that(Selected.optionIn(SingleSelectPage.selector), equals('Poland'))
                ));
        });
    });

    describe.skip('when working with multi-option selects', () => {

        describe('Select.values()', () => {

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should select multiple options by their static value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
                    Select.values('PL', 'DE').from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['PL', 'DE']))
                ));

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should select multiple options by their Answerable value', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
                    Select.values(Text.ofAll(MultiSelectPage.countryCodes)).from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['UK', 'PL']))
                ));

            /** @test {Select.values} */
            /** @test {Selected.valuesOf} */
            it('should concatenate option values from several Answerables', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
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
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
                    Select.values('UK', 'PL').from(MultiSelectPage.selector),
                    Ensure.that(Selected.valuesOf(MultiSelectPage.selector), equals(['UK', 'PL']))
                ));
        });

        describe('Select.options()', () => {

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should select multiple options by their static pageName', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
                    Select.options(['Poland', 'France']).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['Poland', 'France']))));

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should select multiple options by their Answerable name', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
                    Select.options(Text.ofAll(MultiSelectPage.countryNames)).from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['United Kingdom', 'Poland']))
                ));

            /** @test {Select.options} */
            /** @test {Selected.optionsIn} */
            it('should concatenate option values from several Answerables', () =>
                actorCalled('Nick').attemptsTo(
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
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
                    Navigate.to('/screenplay/interactions/select/multi_select.html'),
                    Select.options(['Poland', 'Germany'], 'France').from(MultiSelectPage.selector),
                    Ensure.that(Selected.optionsIn(MultiSelectPage.selector), equals(['Poland', 'Germany', 'France']))
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
