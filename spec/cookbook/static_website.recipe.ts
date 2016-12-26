import synced = require('selenium-webdriver/testing');
import expect = require('../expect');

import { by, protractor } from 'protractor';

import { Actor, Attribute, BrowseTheWeb, Target, Website } from '../../src/screenplay-protractor';
import { Open, Text, WebElement } from '../../src/serenity-protractor';

import { AppServer } from '../support/server';

/*
 * Minimalistic page objects; each one of the below represents a UI widget from the cookbook/apps/basic_forms.html app.
 */

class Cookbook {
    static Main_Heading      = Target.the('main heading').located(by.css('h1'));
    static Secondary_Heading = Target.the('secondary heading').located(by.css('h2'));
    static Article           = Target.the('article').located(by.css('article'));
    static Table_of_Contents = Target.the('table of contents').located(by.css('article nav ul li'));
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
    synced.before(() => james.attemptsTo(Open.browserOn(app.demonstrating('static_website'))));
    synced.after(app.stop());

    synced.it ('can read the text of on-screen elements', () => Promise.all([
        expect(james.toSee(Text.of(Cookbook.Main_Heading)))
            .eventually.equal('Serenity/JS Cookbook'),
        expect(james.toSee(Text.of(Cookbook.Secondary_Heading)))
            .eventually.contain('Recipes'),
    ]));

    synced.it ('can read the text of all elements matching the target', () =>

        expect(james.toSee(Text.ofAll(Cookbook.Table_of_Contents)))
            .eventually.deep.include('Working with static websites'));

    synced.it ('can read the title of the website', () =>

        expect(james.toSee(Website.title()))
            .eventually.equal('Serenity/JS Cookbook'));

    synced.it ('can read an attribute of an on-screen element', () =>

        expect(james.toSee(Attribute.of(Cookbook.Article).called('class')))
            .eventually.equal('container'));

    synced.it ('can check the visibility of an on-screen element', () =>

        expect(james.toSee(WebElement.of(Cookbook.Article))).displayed);
});
