import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWeb, By, ExecuteScript, Navigate, Page, PageElement, Value } from '@serenity-js/web';

/**
 * When the config file uses type-only imports, the WebdriverIO framework adapter loads the ESM build
 * of Serenity/JS modules first, while this spec file, compiled to CommonJS, loads the CJS build.
 *
 * See https://github.com/serenity-js/serenity-js/issues/3535
 */
describe('ExecuteScript, when Serenity/JS modules are loaded from both CJS and ESM builds', () => {

    const Input = PageElement.located(By.id('name')).describedAs('input field');

    beforeEach(() =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),
        ));

    it('runs in a dual-package setup (precondition)', async () => {
        const page = await BrowseTheWeb.as(actorCalled('Joe')).currentPage();

        // The page is created by the ESM copy of @serenity-js/webdriverio,
        // while the Page class imported by this spec comes from the CJS copy of @serenity-js/web.
        // If this precondition fails, the tests below no longer exercise the dual-package hazard.
        expect(page).to.not.be.instanceOf(Page);
    });

    it('allows the actor to execute a script with a PageElement argument', () =>
        actorCalled('Joe').attemptsTo(
            ExecuteScript.sync(`
                var name = arguments[0];
                var field = arguments[1];

                field.value = name;
            `).withArguments(actorCalled('Joe').name, Input),

            Ensure.that(Value.of(Input), equals(actorCalled('Joe').name)),
        ));
});
