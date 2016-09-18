import { protractor } from 'protractor/globals';

import {
    BrowseTheWeb,
    Click,
    Enter,
    Open,
    Text,
    Value,
    Website,
} from '../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../src/serenity/screenplay';

import test = require('selenium-webdriver/testing');

import expect = require('../../expect');

import { Attribute } from '../../../src/serenity-protractor/screenplay/questions/attribute';
import { DemoApp } from './ui/demo_app';

test.describe ('Interactions', () => {

    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    test.beforeEach(() => james.attemptsTo(
        Open.browserOn('resources/index.html')
    ));

    test.it ('should allow to verify the title of a page', () =>
        expect(james.toSee(Website.title())).eventually.equal('demo app') );

    test.it ('should allow to verify text on the page', () =>
        expect(james.toSee(Text.of(DemoApp.Header))).eventually.equal('Angular demo app') );

    test.it ('should allow to interact with an input field', () =>
        james.attemptsTo(
            Enter.theValue('buy some milk').into(DemoApp.Item_Field),
            Click.on(DemoApp.Submit_Button)
        ).then(() =>
            expect(james.toSee(Text.ofAll(DemoApp.Items))).eventually.deep.equal([ 'buy some milk' ]) ));

    test.it ('should allow to read the value of an input field', () =>
        james.attemptsTo(
            Enter.theValue('buy some milk').into(DemoApp.Item_Field)
        ).then(() =>
            expect(james.toSee(Value.of(DemoApp.Item_Field))).eventually.equal('buy some milk') ));

    test.it ('should allow to read the value of an arbitrary attribute', () =>
        expect(james.toSee(Attribute.of(DemoApp.Item_Field).called('id'))).eventually.equal('item') );
});
