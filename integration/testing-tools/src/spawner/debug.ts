import { SpawnResult } from './SpawnResult';

export function ifExitCodeIsOtherThan(expectedExitCode: number, fn: (result: SpawnResult) => SpawnResult): (result: SpawnResult) => SpawnResult {
    return (result: SpawnResult) => {
        return result.exitCode !== expectedExitCode
            ? fn(result)
            : result;
    };
}

const prefixWith = (prefix: string, multiLineText: string) => multiLineText.split('\n').map(line => `[${ prefix }] ${ line }`).join('\n');

export function logOutput(result: SpawnResult): SpawnResult {
    if (result.stdout) {
        console.info(prefixWith('out', result.stdout));
    }

    if (result.stderr) {
        console.error(prefixWith('err', result.stderr));
    }

    return result;
}
