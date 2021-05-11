/* istanbul ignore file covered in integration tests */
import { serenity } from '@serenity-js/core';
import { MochaOptions, Runner } from 'mocha';

import { SerenityReporterForMocha } from './SerenityReporterForMocha';

export = function (runner: Runner, options?: MochaOptions): SerenityReporterForMocha {
    return new SerenityReporterForMocha(serenity, runner, options);
}
