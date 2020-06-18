import { serenity } from '@serenity-js/core';
import { MochaOptions, Runner } from 'mocha';
import { SerenityReporterForMocha } from './SerenityReporterForMocha';

export = function (runner: Runner, options?: MochaOptions) {
    // todo: add requires - a list that includes a serenity config file
    return new SerenityReporterForMocha(serenity, runner, options);
}
