import { LogicError } from '@serenity-js/core';
import type { Selectors } from 'playwright-core';

import type { PlaywrightSelectorEngine } from './PlaywrightSelectorEngine';

/**
 * Utility class responsible for registering custom [Playwright selector engines](https://playwright.dev/docs/extensibility)
 * used internally by Serenity/JS.
 *
 * @internal
 */
export class SerenitySelectorEngines {
    private static isRegistered = false;
    private static readonly engines: Map<string, () => PlaywrightSelectorEngine> = new Map(Object.entries({
        _sjs_closest: () => ({
            query: (root, selector) => {
                return root.closest(selector);
            },
            queryAll: (root, selector) => {
                return [ root.closest(selector) ];
            }
        })
    }))

    async ensureRegisteredWith(selectors: Selectors): Promise<void> {
        // As of Playwright 1.36.1, Selectors don't offer any inspection mechanism,
        // so invoking `register` twice with the same engine name results in a error.
        // Static `isRegistered` helps to work around that
        //  https://github.com/microsoft/playwright/blob/49c1f9eb025d02f8bfc38351592f3466fe8bc242/packages/playwright-core/src/client/selectors.ts
        if (! SerenitySelectorEngines.isRegistered) {
            for (const [ engineName, engine ] of SerenitySelectorEngines.engines) {
                await selectors.register(engineName, engine, { contentScript: true });
            }
            SerenitySelectorEngines.isRegistered = true;
        }
    }

    static engineIdOf(engineName: string): string {
        const prefixedEngineName = `_sjs_${ engineName }`;
        if (!this.engines.has(prefixedEngineName)) {
            throw new LogicError(`${ engineName } is not a valid Serenity/JS Playwright selector engine name. Available engines: ${ this.engines.keys() } `);
        }
        return prefixedEngineName;
    }
}
