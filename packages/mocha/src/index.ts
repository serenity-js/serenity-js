import { serenity } from '@serenity-js/core';
import { MochaOptions, Runner } from 'mocha';
import { SerenityReporterForMocha } from './SerenityReporterForMocha';

export = function (runner: Runner, options?: MochaOptions) {
    return new SerenityReporterForMocha(serenity, runner, options);
}
