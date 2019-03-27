import { stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { by } from 'protractor';

import { Attribute, Navigate, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Attribute', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    /** @test {Attribute} */
    it('allows the actor to read an attribute of a DOM element', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en" />
        `)),

        Ensure.that(Attribute.of(Target.the('DOM').located(by.tagName('html'))).called('lang'), equals('en')),
    ));
});
