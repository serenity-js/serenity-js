import * as playwright from 'playwright-core';

export type PlaywrightNativeElementRoot = Pick<playwright.ElementHandle, '$' | '$$'>;
