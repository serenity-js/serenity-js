import fs from 'node:fs';
import os from 'node:os';
import process from 'node:process';

import { Ability } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io/index.js';
import envinfo from 'envinfo';

import type { SerenityModuleManager } from '../../integration/SerenityModuleManager.js';

export type OverallCompatibilityStatus = 'compatible' | 'runtime-issues' | 'dependency-issues';
export type CompatibilityStatus = 'compatible' | 'incompatible' | 'missing';

export interface CommandMetadata {
    name: string;
    path: string;
    status: CompatibilityStatus;  // todo: extract to avoid duplicating the definition; use z.schema instead
    version: {
        current?: string;
        supported?: string;
    };
}

export interface PackageMetadata {
    name: string;
    status: CompatibilityStatus;  // todo: extract to avoid duplicating the definition; use z.schema instead
    version: {
        current?: string;
        supported?: string;
    };
}

export interface RuntimeEnvironmentScan {
    status: OverallCompatibilityStatus;
    os: {
        name: string;
        cpu: string;
        memory: string;
    };
    shell: CommandMetadata;
    packageManager?: CommandMetadata,
    node?: CommandMetadata,
    git?: CommandMetadata,
    java?: CommandMetadata,
    commands: CommandMetadata[];
    packages: PackageMetadata[];
}

interface EnvinfoCommandMetadata {
    version: string;
    path: string;
}

interface EnvinfoPackageMetadata {
    installed: string;
    wanted: string;
}

interface EnvinfoResult {
    System: {
        OS: string;
        CPU: string;
        Memory: string;
        Shell: EnvinfoCommandMetadata;
    };
    Binaries: {
        Node?: EnvinfoCommandMetadata;
        npm?: EnvinfoCommandMetadata;
        pnpm?: EnvinfoCommandMetadata;
        yarn?: EnvinfoCommandMetadata;
    };
    Utilities: {
        Git?: EnvinfoCommandMetadata;
    };
    Languages: {
        Java: EnvinfoCommandMetadata;
    };
    npmPackages: Record<string, EnvinfoPackageMetadata>
}

export class ScanRuntimeEnvironment extends Ability {
    private static packagesOfInterest = [
        'playwright*',
        '@playwright/*',
        '@sand4rt/experimental-ct-*',
        'cucumber',
        '@cucumber/cucumber',
        'jasmine',
        '@hapi/hapi',
        'express',
        'koa',
        'restify',
        'mocha',
        'protractor',
        '@wdio/*',
        'webdriverio',
        'rimraf',
    ];

    constructor(
        private readonly cwd: string,
        private readonly moduleManager: SerenityModuleManager,
    ) {
        super();
    }

    async scan(directory: string): Promise<RuntimeEnvironmentScan> {
        const scanResult = await this.envinfo(directory);

        const { System, Binaries, Utilities, Languages, npmPackages } = scanResult;

        const commands: RuntimeEnvironmentScan['commands'] = [];
        const allBinaries = { ...Binaries, ...Utilities, ...Languages };
        for (const [ name, details ] of Object.entries(allBinaries)) {
            commands.push(await this.commandMetadata(details));
        }

        const packages: RuntimeEnvironmentScan['packages'] = [];
        for (const [ name, details ] of Object.entries(npmPackages)) {
            packages.push(await this.packageMetadata(name, details));
        }

        return {
            status: this.status(commands, packages),
            os: {
                name: System.OS,
                memory: System.Memory,
                cpu: System.CPU,
            },
            shell: await this.commandMetadata(System.Shell),
            node: await this.commandMetadata(Binaries.Node),
            git: await this.commandMetadata(Utilities.Git),
            java: await this.commandMetadata(Languages.Java),
            packageManager: await this.preferredPackageManager(directory, Binaries),
            commands,
            packages,
        };
    }

    private status(commands: CommandMetadata[], packages: PackageMetadata[]): OverallCompatibilityStatus {
        const hasRuntimeIssues = commands.some(cmd => cmd.status !== 'compatible');
        if (hasRuntimeIssues) {
            return 'runtime-issues';
        }

        const hasDependencyIssues = packages.some(pkg => pkg.status !== 'compatible');

        if (hasDependencyIssues) {
            return 'dependency-issues';
        }

        return 'compatible';
    }

    private async preferredPackageManager(rootDirectory: string, binaries: EnvinfoResult['Binaries']): Promise<CommandMetadata> {
        if (binaries.pnpm && this.fileExists(rootDirectory, 'pnpm-lock.yaml')) {
            return this.commandMetadata(binaries.pnpm);
        }

        if (binaries.yarn && this.fileExists(rootDirectory, 'yarn.lock')) {
            return this.commandMetadata(binaries.yarn);
        }

        return this.commandMetadata(binaries.npm);
    }

    private fileExists(...pathSegments: string[]): boolean {
        try {
            return fs.existsSync(Path.from(...pathSegments).value);
        } catch {
            return false;
        }
    }

    private async envinfo(directory: string): Promise<EnvinfoResult> {
        process.chdir(directory);

        const integrations = JSON.parse(await envinfo.run({
            Binaries: [ 'Node', 'npm', 'pnpm', 'yarn' ],
            Languages: [ 'Java' ],
            System: [ 'Container', 'CPU', 'Memory', 'OS', 'Shell' ],
            Utilities: [ 'Git' ],
            npmPackages: `{${ ScanRuntimeEnvironment.packagesOfInterest.join(',') }}`
        }, { json: true, showNotFound: false, console: false, fullTree: true }));

        const detectedPackages = Object.keys(integrations.npmPackages || {});

        const serenity = JSON.parse(await envinfo.run({
            npmPackages: this.recommendedSerenityPackages(detectedPackages).join(',')
        }, { json: true, showNotFound: true, console: false, fullTree: true }));

        process.chdir(this.cwd);

        return {
            ...integrations,
            npmPackages: {
                ...integrations.npmPackages,
                ...serenity.npmPackages,
            }
        };
    }

    private recommendedSerenityPackages(detectedPackages: string[]): string[] {

        const recommendations = new Set<string>([
            '@serenity-js/assertions',
            '@serenity-js/console-reporter',
            '@serenity-js/core',
            '@serenity-js/rest',
            '@serenity-js/serenity-bdd',
            'npm-failsafe',
            'rimraf',
        ]);

        if (detectedPackages.includes('cucumber') || detectedPackages.includes('@cucumber/cucumber')) {
            recommendations.add('@serenity-js/cucumber');
        }

        if (detectedPackages.includes('jasmine')) {
            recommendations.add('@serenity-js/jasmine');
        }

        if (detectedPackages.includes('mocha')) {
            recommendations.add('@serenity-js/mocha');
        }

        if (detectedPackages.includes('protractor')) {
            recommendations.add('@serenity-js/protractor');
            recommendations.add('@serenity-js/web');
        }

        if (detectedPackages.some(pkg => pkg.includes('playwright'))) {
            recommendations.add('@serenity-js/playwright');
            recommendations.add('@serenity-js/web');
        }

        if (detectedPackages.includes('@playwright/test')) {
            recommendations.add('@serenity-js/playwright-test');
            recommendations.add('@serenity-js/playwright');
            recommendations.add('@serenity-js/web');
        }

        if (detectedPackages.some(pkg => pkg.includes('webdriverio') || pkg.includes('@wdio/'))) {
            recommendations.add('@serenity-js/webdriverio');
            recommendations.add('@serenity-js/web');
        }

        if (detectedPackages.some(pkg => pkg.includes('express') || pkg.includes('koa') || pkg.includes('hapi') || pkg.includes('restify'))) {
            recommendations.add('@serenity-js/local-server');
        }

        return Array.from(recommendations);
    }

    private async commandMetadata(metadata: EnvinfoCommandMetadata): Promise<CommandMetadata> {

        const absolutePath = this.absolute(metadata.path);
        const name = absolutePath.basename().split('.')[0]?.toLowerCase();

        const compatibility = await this.moduleManager.compatibilityStatus(name, metadata.version)

        return {
            name,
            path: absolutePath.value,
            status: compatibility.status,
            version: compatibility.version,
        }
    }

    private async packageMetadata(name: string, metadata: EnvinfoPackageMetadata): Promise<PackageMetadata> {

        const compatibility = await this.moduleManager.compatibilityStatus(name, metadata.installed)

        return {
            name,
            status: compatibility.status,
            version: compatibility.version,
        }
    }

    private absolute(maybeRelativePath: string): Path {
        if (maybeRelativePath.startsWith('~')) {
            return Path.from(os.homedir()).resolve(Path.from('.' + maybeRelativePath.slice(1)));
        }

        if (maybeRelativePath.startsWith('.')) {
            return Path.from(process.cwd()).resolve(Path.from(maybeRelativePath));
        }

        return Path.from(maybeRelativePath);
    }
}
