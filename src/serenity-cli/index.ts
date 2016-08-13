import yargs = require('yargs');
import winston = require('winston');

import { logger } from './logger';

logger.add(winston.transports.Console, { colorize: true });

yargs
    .version(() => require('../package.json').version)
    .demand(1)
    .boolean('verbose')
    .usage('Usage: $0 <command> [options]')
    .example('$0 update [options]', 'updates the Serenity jar to the latest version')
    .example('$0 remove [options]', 'removes the cache directory and downloaded jars')
    .example('$0 run [options]',    'generates the HTML report')
    .example('$0 <command> --help', 'shows the available parameters')
    .epilog('copyright (C) Jan Molak <jan.molak@smartcodeltd.co.uk>')
    .commandDir('commands')
    .alias('h', 'help').help()
    .argv;
