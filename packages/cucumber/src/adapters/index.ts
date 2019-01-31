import { ConfigurationError, serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';

import Gherkin = require('gherkin');
const Module = require('module');             // tslint:disable-line:no-var-requires     No type definitions available
import * as path from 'path';

import { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper, FeatureFileParser } from '../gherkin';
import { Notifier } from '../notifier';

export function adapterForCucumber(version: number, cucumber: any) {

    try {
        const
            notifier = new Notifier(serenity.stageManager),
            mapper   = new FeatureFileMapper(),
            cache    = new Cache<Path, FeatureFileMap>(),
            loader   = new FeatureFileLoader(
                new FeatureFileParser(new Gherkin.Parser()),
                mapper,
                cache,
            );

        return require(`./cucumber-${ version }`)({
            notifier,
            mapper,
            cache,
            loader,
            cucumber,
        });
    }
    catch (error) {
        throw new ConfigurationError(`Cucumber version ${ version } is not supported yet.`, error);
    }
}

export function resolveFrom(fromDir: string, moduleId: string): string {
    const fromFile = path.join(fromDir, 'noop.js');

    return Module._resolveFilename(moduleId, {
        id: fromFile,
        filename: fromFile,
        paths: Module._nodeModulePaths(fromDir),
    });
}

export function requireFrom(fromDir: string, moduleId: string): any {
    try {
        return require(resolveFrom(fromDir, moduleId));
    }
    catch (e) {
        return require(moduleId);
    }
}
