import { serenity } from '@serenity-js/core';
import { ModuleLoader, Path } from '@serenity-js/core/lib/io/index.js';

import { WebdriverIOFrameworkAdapterFactory } from './adapter/index.js';

const adapterFactory = new WebdriverIOFrameworkAdapterFactory(
    serenity,
    new ModuleLoader(process.cwd()),
    Path.from(process.cwd()),
);

export default adapterFactory;

export * from './api.js';
