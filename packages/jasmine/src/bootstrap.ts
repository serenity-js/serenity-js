import { serenity } from '@serenity-js/core';
import { monkeyPatched } from './mokeyPatched';
import { SerenityReporterForJasmine } from './SerenityReporterForJasmine';

/**
 * @desc
 *  Monkey-patches Jasmine's Suite and Spec so that they provide more accurate information and
 *  returns a bootstrapped instance of the {@link SerenityReporterForJasmine} to be registered with Jasmine.
 *
 * @example <caption>Registering the reporter from the command line</caption>
 * jasmine --reporter=@serenity-js/jasmine
 *
 * @example <caption>Registering the reporter programmatically</caption>
 * import serenityReporterForJasmine = require('@serenity-js/jasmine');
 *
 * jasmine.getEnv().addReporter(serenityReporterForJasmine);
 *
 * @see {@link monkeyPatched}
 * @see {@link SerenityReporterForJasmine}
 *
 * @param {jasmine} jasmine - the global.jasmine instance
 * @returns {SerenityReporterForJasmine}
 */
export function bootstrap(jasmine = (global as any).jasmine) {
    jasmine.Suite = monkeyPatched(jasmine.Suite);
    jasmine.Spec = monkeyPatched(jasmine.Spec);

    jasmine.getEnv().afterEach(() => serenity.waitForNextCue());

    return new SerenityReporterForJasmine(serenity);
}
