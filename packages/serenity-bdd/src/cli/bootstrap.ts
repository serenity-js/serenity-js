import yargs = require('yargs');

import { serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { Actors } from './stage';

const pkg = require('../../package.json');  // tslint:disable-line:no-var-requires

/**
 * @desc
 *  Allows for the serenity-bdd command line interface output to be intercepted for testing purposes.
 *
 * @typedef {function(error: Error, parsed: object, output: string): void} Interceptor
 *
 * @package
 */
export type Interceptor = (error: Error, parsed: { [key: string]: string | number }, output: string) => void;

/**
 * @desc
 *  Invokes the serenity-bdd command line interface, responsible for downloading and running
 *  the [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-cli)
 *
 * @param {string[]} argv
 * @param {Interceptor} interceptor
 *
 * @package
 */
export function bootstrap(argv: string[], interceptor?: Interceptor) {

    yargs()
        .version(require('../../package.json').version)
        .demand(1)
        .usage('Usage: $0 <command> [options]')
        .example('$0 update [options]', 'updates the Serenity jar to the latest version')
        .example('$0 remove [options]', 'removes the cache directory and downloaded jars')
        .example('$0 run [options]',    'generates the HTML report from JSON reports produced by Serenity/JS')
        .example('$0 <command> --help', 'shows the available parameters')
        .epilog(`copyright (C) 2016-${ new Date().getFullYear() } ${ pkg.author.name } <${ pkg.author.email }>`)
        .commandDir('./commands')
        .alias('h', 'help').help()
        .parse(argv, {
            stage: serenity.callToStageFor(new Actors(new Path(process.cwd()))),
        }, interceptor);
}
