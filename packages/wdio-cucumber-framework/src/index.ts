import { default as adapter, type WebdriverIOConfig } from '@serenity-js/webdriverio';
import type { Capabilities } from '@wdio/types';

export { WebdriverIOConfig } from '@serenity-js/webdriverio';

export default {
    async init(cid: string, config: WebdriverIOConfig, specs: string[], capabilities: Capabilities.RemoteCapability, reporter: Parameters<typeof adapter['init']>[4]): Promise<{ hasTests: () => boolean, run: () => Promise<number> }> {
        return adapter.init(cid, {
            ...config,
            serenity: {
                runner: 'cucumber',
                ...config.serenity
            },
            cucumberOpts: {
                ...config.cucumberOpts,
            }
        }, specs, capabilities, reporter);
    }
};
