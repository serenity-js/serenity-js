import { SpawnResult } from './SpawnResult';

export function ifExitCodeIsOtherThan(expectedExitCode: number, fn: (result: SpawnResult) => SpawnResult) {
    return (result: SpawnResult): SpawnResult => {
        return result.exitCode === expectedExitCode
            ? result
            : fn(result);
    };
}

function prefixWith(prefix: string, multiLineText: string) {
    return multiLineText.split('\n').map(line => `[${ prefix }] ${ line }`).join('\n');
}

export function logOutput(result: SpawnResult): SpawnResult {
    if (result.stdout) {
        console.info(prefixWith('out', result.stdout));
    }

    if (result.stderr) {
        console.error(prefixWith('err', result.stderr));
    }

    return result;
}
