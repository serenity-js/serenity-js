import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import type { Element, ElementArray } from 'webdriverio';

import { by, Locator, Navigate, Target, Text } from '../../../src';

describe('by', () => {

    describe('id', () => {

        it('should retrieve a matching element', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/id_one.html'),

                Ensure.that(Text.of(element(by.id('example'))), equals('Example')),
            ));

        it('should retrieve all matching elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/id_all.html'),

                Ensure.that(Text.ofAll(elements(by.id('example'))), equals(['First Example', 'Second Example'])),
            ));

        // todo: test toString in context in which it's going to be used
    });

    describe('css', () => {

        it('should retrieve a matching element', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/css_one.html'),

                Ensure.that(Text.of(element(by.css('.example'))), equals('Example')),
            ));

        it('should retrieve all matching elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/css_all.html'),

                Ensure.that(Text.ofAll(elements(by.css('.example'))), equals(['First Example', 'Second Example'])),
            ));
    });

    describe('tagName', () => {

        it('should retrieve a matching element', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/tag_name_one.html'),

                Ensure.that(Text.of(element(by.tagName('li'))), equals('Example')),
            ));

        it('should retrieve all matching elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/tag_name_all.html'),

                Ensure.that(Text.ofAll(elements(by.css('li'))), equals(['First Example', 'Second Example'])),
            ));
    });

    describe('linkText', () => {

        it('should retrieve a matching element', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/link_text_one.html'),

                Ensure.that(Text.of(element(by.linkText('Serenity/JS'))), equals('Serenity/JS')),
            ));

        it('should retrieve all matching elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/link_text_all.html'),

                Ensure.that(Text.ofAll(elements(by.linkText('Example'))), equals(['Example', 'Example'])),
            ));
    });

    describe('partialLinkText', () => {

        it('should retrieve a matching element', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/partial_link_text_one.html'),

                Ensure.that(Text.of(element(by.partialLinkText('JS'))), equals('Serenity/JS')),
            ));

        it('should retrieve all matching elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/partial_link_text_all.html'),

                Ensure.that(Text.ofAll(elements(by.partialLinkText('Serenity'))), equals(['Serenity/JS', 'Serenity BDD'])),
            ));
    });

    describe('xpath', () => {

        it('should retrieve a matching element', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/xpath_one.html'),

                Ensure.that(Text.of(element(by.xpath('//li'))), equals('Example')),
            ));

        it('should retrieve all matching elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/locators/xpath_all.html'),

                Ensure.that(Text.ofAll(elements(by.xpath('//li'))), equals(['First Example', 'Second Example'])),
            ));
    });
});

function element(locator: Locator): Question<Promise<Element<'async'>>> {
    return Target.the('example element').located(locator);
}

function elements(locator: Locator): Question<Promise<ElementArray>> {
    return Target.all('example elements').located(locator);
}
