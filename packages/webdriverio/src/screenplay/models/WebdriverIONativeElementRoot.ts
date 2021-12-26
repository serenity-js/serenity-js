import * as wdio from 'webdriverio';

export type WebdriverIONativeElementRoot = Pick<wdio.Browser<'async'>, '$' | '$$'>;
