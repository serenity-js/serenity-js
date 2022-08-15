import { serenity } from '@serenity-js/core';
import { ModuleLoader, Version } from '@serenity-js/core/lib/io';

const loader = new ModuleLoader(process.cwd());

const version = loader.hasAvailable('@cucumber/cucumber')
    ? loader.versionOf('@cucumber/cucumber')
    : loader.versionOf('cucumber');

/**
 * Registers a Cucumber reporter that emits {@apilink DomainEvent|Serenity/JS domain events}
 * and informs Serenity/JS when test scenarios and Cucumber steps start, finish, and with what result.
 */
const listener: unknown = version.isAtLeast(new Version('7.0.0'))
    ? require('./listeners/messages').createListener(serenity, loader)  // eslint-disable-line @typescript-eslint/no-var-requires
    : require('./listeners/legacy').createListener(serenity, loader)    // eslint-disable-line @typescript-eslint/no-var-requires

export = listener;
