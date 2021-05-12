import { serenity } from '@serenity-js/core';
import { ModuleLoader, Version } from '@serenity-js/core/lib/io';

const loader = new ModuleLoader(process.cwd());

const version = loader.hasAvailable('@cucumber/cucumber')
    ? loader.versionOf('@cucumber/cucumber')
    : loader.versionOf('cucumber');

export = version.isAtLeast(new Version('7.0.0'))
    ? require('./listeners/messages').createListener(serenity, loader)  // eslint-disable-line @typescript-eslint/no-var-requires
    : require('./listeners/legacy').createListener(serenity, loader)    // eslint-disable-line @typescript-eslint/no-var-requires
