import { Page } from "playwright";

export type PlaywrightNativeRootElement = Pick<Page, '$' | '$$'>;

