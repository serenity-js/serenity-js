import { SpawnResult } from './SpawnResult';

export function ifExitCodeIsOtherThan(expectedExitCode: number, fn: (res: SpawnResult) => SpawnResult) {
    return (result: SpawnResult) => {
        return result.exitCode !== expectedExitCode
            ? fn(result)
            : result;
    };
}

export function logOutput(res: SpawnResult): SpawnResult {
    const prefixWith = (prefix: string, multiLineText: string) => multiLineText.split('\n').map(line => `[${ prefix }] ${ line }`).join('\n');

    if (!! res.stdout) {
        console.info(prefixWith('out', res.stdout));    // tslint:disable-line:no-console
    }

    if (!! res.stderr) {
        console.error(prefixWith('err', res.stderr));   // tslint:disable-line:no-console
    }

    return res;
}
