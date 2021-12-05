import * as wdio from 'webdriverio';

export type WebdriverIONativeElementSearchContext = Pick<wdio.Browser<'async'>, '$' | '$$' | 'react$' | 'react$$'>;
