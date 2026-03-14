import { serenity } from '@serenity-js/core';
import { ModuleLoader, Version } from '@serenity-js/core/lib/io/index.js';
import * as process from 'process';

import { createListener as createLegacyListener } from './listeners/legacy/index.js';
import { createListener as createMessagesListener } from './listeners/messages/index.js';

const cwd = process.cwd();
const loader = new ModuleLoader(cwd);

const version = loader.hasAvailable('@cucumber/cucumber')
    ? loader.versionOf('@cucumber/cucumber')
    : loader.versionOf('cucumber');

/**
 * Registers a Cucumber reporter that emits [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/)
 * and informs Serenity/JS when test scenarios and Cucumber steps start, finish, and with what result.
 */
const listener: unknown = version.isAtLeast(new Version('7.0.0'))
    ? createMessagesListener(serenity, loader)
    : createLegacyListener(serenity, loader)

export default listener;
