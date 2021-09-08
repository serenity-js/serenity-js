import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { Attribute, by, Navigate, Target } from '@serenity-js/web';

import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Attribute', () => {

    beforeEach(() => engage(new UIActors()));

    /** @test {Attribute} */
    it('allows the actor to read an attribute of a DOM element', () => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en" />
        `)),

        Ensure.that(Attribute.called('lang').of(Target.the('DOM').located(by.tagName('html'))), equals('en')),
    ));
});
