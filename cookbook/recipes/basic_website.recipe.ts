import synced = require('selenium-webdriver/testing');
import expect = require('../expect');

import { Actor, BrowseTheWeb, Target, Website } from '../../src/screenplay-protractor';
import { Open, Text } from '../../src/serenity-protractor';
import { AppServer } from '../server';
import { by, protractor } from 'protractor';
import { Attribute } from '../../src/serenity-protractor/screenplay/questions/attribute';

/*
 * Minimalistic page objects; each one of the below represents a UI widget from the cookbook/apps/basic_forms.html app.
 */

class Cookbook {
    static Main_Heading      = Target.the('main heading').located(by.css('h1'));
    static Secondary_Heading = Target.the('secondary heading').located(by.css('h2'));
    static Article           = Target.the('article').located(by.css('article'));
}

synced.describe ('When demonstrating the usage of a HTML page, a test scenario', function () {

    this.timeout(10000);

    let app   = new AppServer();
    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    synced.before(app.start());
    synced.before(() => {
        // this is a standard, non-angular website; no need for angular-specific synchronisation here
        protractor.browser.ignoreSynchronization = true;
    });
    synced.after(app.stop());

    synced.it ('can read the text of on-screen elements', () =>

        james.attemptsTo(
            Open.browserOn(app.demonstrating('basic_website'))
        ).then(() => Promise.all([
            expect(james.toSee(Text.of(Cookbook.Main_Heading))).eventually.equal('Serenity/JS Cookbook'),
            expect(james.toSee(Text.of(Cookbook.Secondary_Heading))).eventually.contain('Recipes'),
        ]))
    );

    synced.it ('can read the title of the website', () =>

        james.attemptsTo(
            Open.browserOn(app.demonstrating('basic_website'))
        ).then(() =>
            expect(james.toSee(Website.title())).eventually.equal('Serenity/JS Cookbook')
        )
    );

    synced.it ('can read an attribute of an on-screen element', () =>

        james.attemptsTo(
            Open.browserOn(app.demonstrating('basic_website'))
        ).then(() =>
            expect(james.toSee(Attribute.of(Cookbook.Article).called('class'))).eventually.equal('container')
        )
    );
});
