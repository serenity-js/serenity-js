import { serenity } from '@serenity-js/core';
import Gherkin = require('gherkin');
const Module = require('module');             // tslint:disable-line:no-var-requires     No type definitions available
import * as path from 'path';

import { FeatureFileLoader, FeatureFileMapper, FeatureFileParser } from '../gherkin';
import { Notifier } from '../notifier';

export function adapterForCucumber(version: number, cucumber: any) {

    try {
        const
            notifier = new Notifier(serenity.stageManager),
            loader = new FeatureFileLoader(
                new FeatureFileParser(new Gherkin.Parser()),
                new FeatureFileMapper(),
            );

        return require(`./cucumber-${ version }`)({ notifier, loader, cucumber });
    }
    catch (error) {
        throw new Error(`Cucumber version ${ version } is not supported yet.`);
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
