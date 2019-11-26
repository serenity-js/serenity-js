import 'mocha';
import { Ensure, equals } from '@serenity-js/assertions';
import { by } from 'protractor';
import { Navigate, Select, SelectedOption, SelectedOptions, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';
import { actorCalled, engage } from '@serenity-js/core';

describe('SelectedOption', () => {

    beforeEach(() => engage(new UIActors()));

    class SingleCountry {
        static Selector = Target.the('country selector').located(by.id('single-option'));
    }

    /** @test {SelectedOption} */
    const pageWithSingleSelect = `
    <html>
        <body>
        <form>
            <fieldset name='options'>
                <legend>Working with single option</legend>
                <label for='single-option'>
                    Country
                    <select id='single-option'>
                        <option label='United Kingdom' value='GB' selected='selected'>United Kingdom</option>
                        <option label='Poland' value='PL' selected='selected'>Poland</option>
                        <option label='Germany' value='DE' selected='selected'>Germany</option>
                        <option label='France' value='FR'>France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedOption.of} */
    it('should return a single value when a single text argument is passed to Select.option()', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithSingleSelect)),
            Select.option('FR').from(SingleCountry.Selector),
            Ensure.that(SelectedOption.of(SingleCountry.Selector), equals('FR'))));
});

describe('SelectedOption', () => {

    beforeEach(() => engage(new UIActors()));

    class SingleCountry {
        static Selector = Target.the('country selector').located(by.id('single-option'));
    }

    class TextInput {
        static Selector = Target.the('country text').located(by.id('country-text'));
    }

    /** @test {SelectedOption} */
    const pageWithSingleSelect = `
    <html>
        <body>
        <input>
            <p id='country-text'>PL</p>
            <fieldset name='options'>
                <legend>Working with single option</legend>
                <label for='single-option'>
                    Country
                    <select id='single-option'>
                        <option label='United Kingdom' value='GB' selected='selected'>United Kingdom</option>
                        <option label='Poland' value='PL' selected='selected'>Poland</option>
                        <option label='Germany' value='DE' selected='selected'>Germany</option>
                        <option label='France' value='FR'>France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedOption.of} */
    it('should return a single value when a single answerable argument is passed to Select.option()', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithSingleSelect)),
            Select.option(Text.of(TextInput.Selector)).from(SingleCountry.Selector),
            Ensure.that(SelectedOption.of(SingleCountry.Selector), equals('PL'))));
});

describe('SelectedOptions', () => {
    class MultiCountry {
        static Selector = Target.the('country selector').located(by.id('multiple-options'));
    }

    /** @test {SelectedOptions} */
    const pageWithMultipleSelects = `
    <html>
        <body>
        <form>
            <fieldset name='options'>
                <legend>Working with options</legend>
                <label for='multiple-options'>
                    Country
                    <select multiple='' id='multiple-options'>
                        <option label='United Kingdom' value='GB'>United Kingdom</option>
                        <option label='Poland' value='PL'>Poland</option>
                        <option label='Germany' value='DE'>Germany</option>
                        <option label='France' value='FR'>France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedOptions.of} */
    it('should return a multiple values when multiple text arguments are passed to Select', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithMultipleSelects)),
            Select.options(['PL', 'DE']).from(MultiCountry.Selector),
            Ensure.that(SelectedOptions.of(MultiCountry.Selector), equals(['PL', 'DE']))));

});

describe('SelectedOptions', () => {
    class MultiCountry {
        static Selector = Target.the('country selector').located(by.id('multiple-options'));
    }

    class ListOfItems {
        static Selector = Target.all('country list').located(by.tagName('li'));
    }

    /** @test {SelectedOptions} */
    const pageWithMultipleSelects = `
    <html>
        <body>
        <form>
            <ul>
                <li>PL</li>
                <li>GB</li>
            </ul>
            <fieldset name='options'>
                <legend>Working with options</legend>
                <label for='multiple-options'>
                    Country
                    <select multiple='' id='multiple-options'>
                        <option label='United Kingdom' value='GB'>United Kingdom</option>
                        <option label='Poland' value='PL'>Poland</option>
                        <option label='Germany' value='DE'>Germany</option>
                        <option label='France' value='FR'>France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedOptions.of} */
    it('should return a multiple values when multiple text arguments are passed to Select', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithMultipleSelects)),
            Select.options(Text.ofAll(ListOfItems.Selector)).from(MultiCountry.Selector),
            Ensure.that(SelectedOptions.of(MultiCountry.Selector), equals(['GB', 'PL']))));

});
