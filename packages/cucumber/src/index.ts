import { serenity } from '@serenity-js/core';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import { listenerForCucumber } from './listeners';

const loader = new ModuleLoader(process.cwd());

const version = loader.versionOf('cucumber');
const cucumber = loader.require('cucumber');

export = listenerForCucumber(version, cucumber, serenity);
