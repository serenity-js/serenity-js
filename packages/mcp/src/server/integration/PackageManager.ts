import type { ExecException, ExecOptions } from 'node:child_process';
import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execCallback)

interface PackageManagerInstallOptions {
    scope: 'production' | 'development';
}

export interface CommandExecutionResult {
    stdout: string;
    stderr: string;
    error?: Error;
}

export class CliCommand {
    constructor(
        private readonly pathToBinary: string,
        private parameters: string[],
        private readonly options: ExecOptions,
    ) {
    }

    async execute(): Promise<CommandExecutionResult> {
        try {
            return await exec(this.command(), this.options) as CommandExecutionResult;
        }
        catch (execError) {

            const error = execError as ExecException;

            return {
                error,
                stdout: error.stdout,
                stderr: error.stderr,
            }
        }
    }

    public toString(): string {
        return this.command();
    }

    private command(): string {
        return [
            this.pathToBinary,
            ...this.parameters
        ].join(' ');
    }
}

export abstract class PackageManager {
    constructor(
        private readonly pathToBinary: string,
        private readonly options: ExecOptions,
    ) {
    }

    abstract install(dependencies: string[], options: PackageManagerInstallOptions): CliCommand;

    abstract run(scriptName: string, parameters: string[]): CliCommand;

    protected command(...parameters: string[]): CliCommand {
        return new CliCommand(
            this.pathToBinary,
            parameters.filter(Boolean),
            this.options,
        )
    }
}

export class Npm extends PackageManager {
    install(dependencies: string[], options: PackageManagerInstallOptions): CliCommand {
        const save = options.scope === 'production'
            ? '--save'
            : '--save-dev';

        return this.command('install', save, ...dependencies);
    }
    run(scriptName: string, parameters: string[]): CliCommand {
        return this.command('run', scriptName, ...parameters);
    }
}

export class Pnpm extends PackageManager {
    install(dependencies: string[], options: PackageManagerInstallOptions): CliCommand {
        const save = options.scope === 'production' ? '' :  '--save-dev';

        return this.command('add', save, ...dependencies);
    }

    run(scriptName: string, parameters: string[]): CliCommand {
        return this.command('run', scriptName, ...parameters);
    }
}

export class Yarn extends PackageManager {
    install(dependencies: string[], options: PackageManagerInstallOptions): CliCommand {
        const save = options.scope === 'production' ? '' :  '--dev';

        return this.command('add', save, ...dependencies);
    }

    run(scriptName: string, parameters: string[]): CliCommand {
        return this.command('run', scriptName, ...parameters);
    }
}
