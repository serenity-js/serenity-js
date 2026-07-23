import { Ensure, equals } from '@serenity-js/assertions';
import { notes, Wait } from '@serenity-js/core';
import { Attribute, By, Navigate, Page, PageElement } from '@serenity-js/web';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

const documentRoot = PageElement.located(By.css('html')).describedAs('document root');
const currentTheme = () => Attribute.called('data-theme').of(documentRoot);

describe('Navigation', () => {

    describe('Deep Linking', () => {

        it('allows sharing a link to a filtered scenario view', { tag: '@showcase' }, async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                // Remember the current URL
                notes().set('sharedUrl', Page.current().url().href),

                // Navigate away and back via the shared link
                Navigate.to(notes().get('sharedUrl')),

                // The filtered view is restored
                Ensure.that(scenariosView.scenarioCalled(failingTest).isPresent(), equals(true)),
            );
        });

        it('toggles between light and dark themes', async ({ actor, navigation }) => {
            await actor.attemptsTo(
                notes().set('initialTheme', currentTheme()),
                navigation.selectTheme('Dark'),

                Wait.until(currentTheme(), equals('dark')),
                Ensure.that(currentTheme(), equals('dark')),
            );
        });
    });
});
