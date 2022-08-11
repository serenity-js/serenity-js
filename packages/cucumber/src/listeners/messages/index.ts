import { Serenity } from '@serenity-js/core';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import cucumberMessagesListener = require('./CucumberMessagesListener');

/**
 * @desc
 *  Creates a listener for Cucumber.js v7.x and above
 *
 * @param serenity
 * @param moduleLoader
 */
export function createListener(serenity: Serenity, moduleLoader: ModuleLoader): any {
    return cucumberMessagesListener(
        serenity,
        moduleLoader,
    );
}
