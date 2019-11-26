import 'mocha';
import { Ensure, equals } from '@serenity-js/assertions';
import { by } from 'protractor';
import { Navigate, Select, SelectedText, SelectedTextItems, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';
import { actorCalled, engage } from '@serenity-js/core';

describe('SelectedText', () => {

    beforeEach(() => engage(new UIActors()));

    class SingleCountry {
        static Selector = Target.the('country selector').located(by.id('single-option'));
    }

    /** @test {SelectedText} */
    const pageWithSingleSelect = `
    <html>
        <body>
        <form>
            <fieldset name="options">
                <legend>Working with single option</legend>
                <label for="single-option">
                    Country
                    <select id="single-option">
                        <option label="United Kingdom" value="GB" selected="selected">United Kingdom</option>
                        <option label="Poland" value="PL" selected="selected">Poland</option>
                        <option label="Germany" value="DE" selected="selected">Germany</option>
                        <option label="France" value="FR">France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedText.of} */
    it('should return a single value when a single text item is passed to Select.text()', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithSingleSelect)),
            Select.text('France').from(SingleCountry.Selector),
            Ensure.that(SelectedText.of(SingleCountry.Selector), equals('France'))));

});

describe('SelectedTextItems', () => {

    beforeEach(() => engage(new UIActors()));

    class MultiCountry {
        static Selector = Target.the('country selector').located(by.id('multiple-options'));
    }

    /** @test {SelectedText} */
    const pageWithMultipleSelects = `
    <html>
        <body>
        <form>
            <fieldset name="options">
                <legend>Working with options</legend>
                <label for="multiple-options">
                    Country
                    <select multiple="" id="multiple-options">
                        <option label="United Kingdom" value="GB">United Kingdom</option>
                        <option label="Poland" value="PL">Poland</option>
                        <option label="Germany" value="DE">Germany</option>
                        <option label="France" value="FR">France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedText.of} */
    it('should return a multiple values when an array of text items is passed to Select.textValues()', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithMultipleSelects)),
            Select.textValues(['Poland', 'France']).from(MultiCountry.Selector),
            Ensure.that(SelectedTextItems.of(MultiCountry.Selector), equals(['Poland', 'France']))));

});

describe('SelectedTextItems', () => {

    beforeEach(() => engage(new UIActors()));

    class MultiCountry {
        static Selector = Target.the('country selector').located(by.id('multiple-options'));
    }

    class ListOfItems {
        static Selector = Target.all('country list').located(by.tagName('li'));
    }

    /** @test {SelectedText} */
    const pageWithMultipleSelects = `
    <html>
        <body>
        <form>
            <ul>
                <li>Poland</li>
                <li>Germany</li>
            </ul>
            <fieldset name="options">
                <legend>Working with options</legend>
                <label for="multiple-options">
                    Country
                    <select multiple="" id="multiple-options">
                        <option label="United Kingdom" value="GB">United Kingdom</option>
                        <option label="Poland" value="PL">Poland</option>
                        <option label="Germany" value="DE">Germany</option>
                        <option label="France" value="FR">France</option>
                    </select>
                </label>
            </fieldset>
        </form>
        </body>
    </html>`;
    /** @test {SelectedText.of} */
    it('should return a multiple values when an answerable array of text items is passed to Select.textValues()', () =>
        actorCalled('Nick').attemptsTo(
            Navigate.to(pageFromTemplate(pageWithMultipleSelects)),
            Select.textValues(Text.ofAll(ListOfItems.Selector)).from(MultiCountry.Selector),
            Ensure.that(SelectedTextItems.of(MultiCountry.Selector), equals(['Poland', 'Germany']))));

});
