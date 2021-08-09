import { serenity } from '@serenity-js/core';
import { ModuleLoader, Path } from '@serenity-js/core/lib/io';

import { WebdriverIOFrameworkAdapterFactory } from './adapter';

const adapterFactory = new WebdriverIOFrameworkAdapterFactory(
    serenity,
    new ModuleLoader(process.cwd()),
    Path.from(process.cwd()),
);

export default adapterFactory;

export { WebdriverIOConfig } from './adapter';
export * from './expectations';
export * from './input';
export * from './screenplay';
export * from './stage';
