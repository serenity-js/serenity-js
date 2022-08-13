import Reporter from '@wdio/reporter';
import { Reporters } from '@wdio/types';
import * as fs from 'fs';

export default class Inspector extends Reporter {
    constructor (options: Partial<Reporters.Options>) {
        super({ ...options, stdout: true });

        const outputDirectory = options.outputDir || './log';

        fs.mkdirSync(outputDirectory, { recursive: true });
        const out = fs.createWriteStream(`${ outputDirectory }/wdio.events-${ process.pid }.ndjson`);

        function log(type: string) {
            return (event: object) =>
                out.write(JSON.stringify({ type, event }) + '\n');
        }

        this.on('runner:start', log('runner:start'))
        this.on('suite:start', log('suite:start'))
        this.on('hook:start', log('hook:start'))
        this.on('hook:end', log('hook:end'))
        this.on('test:start', log('test:start'))
        this.on('test:pass', log('test:pass'))
        this.on('test:fail', log('test:fail'))
        this.on('test:retry', log('test:retry'))
        this.on('test:pending', log('test:pending'))
        this.on('test:end', log('test:end'))
        this.on('suite:end', log('suite:end'))
        this.on('runner:end', log('runner:end'))
    }
}
