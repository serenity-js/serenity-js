import childProcess = require('child_process');
import split = require('split');
import { logger } from '../logger';

export const executeWith = (args: string[]) => (pathToBinary: string) => new Promise<boolean>((resolve, reject) => {

    function withAdviseOn(output: string): string {
        switch (true) {
            case output.indexOf('jarfile') > 0:
                return 'Did you remember to run `serenity update`? ' + output;
            case output.indexOf('Unsupported major.minor version') >= 0:
                return 'Looks like you\'re using an old version of Java? Serenity BDD needs Java 7 or newer.';
            default:
                return output;
        }
    }

    function log(output: string) {
        const interestingPartOf = (line: string, after: string) => line.substring(line.indexOf(after) + after.length + 1);

        switch (true) {
            case output.indexOf('DEBUG') >= 0:
                logger.debug(interestingPartOf(output, 'DEBUG'));
                break;
            case output.indexOf('WARN')  >= 0:
                logger.warn (interestingPartOf(output, 'WARN'));
                break;
            case output.indexOf('INFO')  >= 0:
                logger.info (interestingPartOf(output, 'INFO'));
                break;
            case output.length > 0:
                logger.info (output);
                break;
            default:
                break;
        }
    }

    let spawned = childProcess.spawn(pathToBinary, args);

    spawned.stdout.pipe(split()).on('data', log);

    spawned.stderr.pipe(split()).on('data', (problem: string) => {
        if (problem.length > 0) {
            reject(new Error(withAdviseOn(problem)));
        }
    });

    spawned.on('close', (exitCode) => {
        if (exitCode !== 0) {
            reject(new Error(`${pathToBinary} process exited with code ${exitCode}`));
        } else {
            resolve(true);
        }
    });
});
