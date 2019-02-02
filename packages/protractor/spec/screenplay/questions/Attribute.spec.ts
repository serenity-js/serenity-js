import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { Attribute, BrowseTheWeb, Navigate, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Attribute', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    /** @test {Attribute} */
    it('allows the actor to read an attribute of a DOM element', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en" />
        `)),

        Ensure.that(Attribute.of(Target.the('DOM').located(by.tagName('html'))).called('lang'), equals('en')),
    ));
});
