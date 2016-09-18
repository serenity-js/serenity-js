import {
    BrowseTheWeb,
    Open,
    Select,
    SelectedValue,
} from '../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../src/serenity/screenplay';

import { DemoApp } from './ui/demo_app';

import test = require('selenium-webdriver/testing');

import { protractor } from 'protractor/globals';

import expect = require('../../expect');

test.describe ('Interactions', () => {

    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    test.it ('should allow to select an option', () =>
        james.attemptsTo(
            Open.browserOn('resources/index.html'),
            Select.theValue('London').from(DemoApp.Destinations)
        ).then(() =>
            expect(james.toSee(SelectedValue.of(DemoApp.Destinations)))
                .eventually.equal('London')));
});
