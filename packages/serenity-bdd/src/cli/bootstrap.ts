const yargs = require('yargs'); // eslint-disable-line @typescript-eslint/no-var-requires

const pkg = require('../../package.json');  // eslint-disable-line @typescript-eslint/no-var-requires

/**
 * Allows for the serenity-bdd command line interface output to be intercepted for testing purposes.
 *
 * @package
 */
export type Interceptor = (error: Error, parsed: { [key: string]: string | number }, output: string) => void;

/**
 * Invokes the serenity-bdd command line interface, responsible for downloading and running
 * the [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-cli)
 *
 * @param argv
 * @param interceptor
 */
export function bootstrap(argv: string[], interceptor?: Interceptor): void {
    yargs()
        .version(pkg.version)
        .demand(1)
        .usage('Usage: $0 <command> [options]')
        .example('$0 update [options]', 'updates the Serenity jar to the latest version')
        .example('$0 run [options]',    'generates the HTML report from JSON reports produced by Serenity/JS')
        .example('$0 <command> --help', 'shows the available parameters')
        .epilog(`copyright (C) 2016-${ new Date().getFullYear() } ${ pkg.author.name } <${ pkg.author.email }>`)
        .commandDir('./commands')
        .alias('h', 'help').help()
        .parse(argv, { }, interceptor);
}
