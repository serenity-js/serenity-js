import { serenity } from '@serenity-js/core';
import { ModuleLoader, Path } from '@serenity-js/core/lib/io/index.js';
import type { Capabilities } from '@wdio/types';
import type { EventEmitter } from 'events';

import type { InitialisesReporters, ProvidesWriteStream } from './adapter/reporter/index.js';
import type { WebdriverIOConfig } from './config/index.js';

/**
 * WebdriverIO Framework Adapter integrates WebdriverIO with Serenity/JS
 */
export default {
    async init(
        cid: string,
        config: WebdriverIOConfig,
        specs: string[],
        capabilities: Capabilities.RemoteCapability,
        reporter: EventEmitter & ProvidesWriteStream & InitialisesReporters
    ): Promise<{ hasTests: () => boolean, run: () => Promise<number> }> {
        const { WebdriverIOFrameworkAdapterFactory } = await import('./adapter/index.js');

        const adapterFactory = new WebdriverIOFrameworkAdapterFactory(
            serenity,
            new ModuleLoader(process.cwd()),
            Path.from(process.cwd()),
        );

        return adapterFactory.init(cid, config, specs, capabilities, reporter);
    }
};

export * from './api.js';
