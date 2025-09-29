import fs from 'node:fs';
import os from 'node:os';
import process from 'node:process';

import { Ability, ConfigurationError } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io/index.js';
import envinfo from 'envinfo';

import type { SerenityModuleManager } from '../../integration/SerenityModuleManager.js';

export type OverallCompatibilityStatus = 'compatible' | 'runtime-issues' | 'dependency-issues';
export type CompatibilityStatus = 'compatible' | 'incompatible' | 'missing';

export interface DependencyMetadata {
    name: string;
    status: CompatibilityStatus;  // todo: extract to avoid duplicating the definition; use z.schema instead
    version: {
        current?: string;
        supported?: string;
    };
}

export interface CommandMetadata extends DependencyMetadata {
    path: string;
}

export interface PackageMetadata extends DependencyMetadata {
}

type TestRunner =
    | 'cucumber'
    | 'jasmine'
    | 'mocha'
    | 'playwright-test'
    | 'protractor-cucumber'
    | 'protractor-jasmine'
    | 'protractor-mocha'
    | 'webdriverio-cucumber'
    | 'webdriverio-jasmine'
    | 'webdriverio-mocha';

export interface RuntimeEnvironmentScan {
    rootDirectory: string;
    status: OverallCompatibilityStatus;
    os: {
        name: string;
        cpu: string;
        memory: string;
    };
    git?: CommandMetadata,
    java?: CommandMetadata,
    node?: CommandMetadata,
    packageManager?: CommandMetadata,
    shell: CommandMetadata;
    commands: CommandMetadata[];
    packages: PackageMetadata[];
    testRunner: TestRunner;
    environmentVariables: Record<string, string>;
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

    async scan(rootDirectory: string): Promise<RuntimeEnvironmentScan> {
        if (! await this.isReadableDirectory(rootDirectory)) {
            throw new Error(`The path ${ rootDirectory } is not a directory or cannot be accessed`);
        }

        const scanResult = await this.envinfo(rootDirectory);

        const { System, Binaries, Utilities, Languages, npmPackages } = scanResult;

        const commands: RuntimeEnvironmentScan['commands'] = [];
        const allBinaries = { ...Binaries, ...Utilities, ...Languages };
        for (const [ name_, details ] of Object.entries(allBinaries)) {
            commands.push(await this.commandMetadata(details));
        }

        const packages: RuntimeEnvironmentScan['packages'] = [];
        for (const [ name, details ] of Object.entries(npmPackages)) {
            packages.push(await this.packageMetadata(name, details));
        }

        const PATH = commands.reduce((acc, tool) => tool.path ? `${ Path.from(tool.path).directory().value }:${ acc }` : acc, process.env.PATH ?? '');
        const JAVA_HOME = scanResult.Languages?.Java?.path ? Path.from(scanResult.Languages.Java.path).directory().directory().value : (process.env.JAVA_HOME ?? '');

        const environmentVariables = {
            ...process.env,
            PATH,
            JAVA_HOME,
        };

        return {
            rootDirectory,
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
            packageManager: await this.preferredPackageManager(rootDirectory, Binaries),
            testRunner: this.testRunner(packages),
            commands,
            packages,
            environmentVariables,
        };
    }

    private testRunner(packages: PackageMetadata[]): TestRunner {
        const detectedPackages = new Set(packages.map(metadata => metadata.name));

        const usesWebdriverIO = (detectedPackages.has('webdriverio') || detectedPackages.has('@wdio/cli'));
        const usesProtractor = !! detectedPackages.has('protractor');
        const usesCucumber = !! (detectedPackages.has('cucumber') || detectedPackages.has('@cucumber/cucumber'));
        const usesJasmine = !! detectedPackages.has('jasmine');
        const usesMocha = !! detectedPackages.has('mocha');
        const usesPlaywrightTest = !! detectedPackages.has('@playwright/test');

        switch(true) {
            case usesWebdriverIO && usesCucumber:
                return 'webdriverio-cucumber';
            case usesWebdriverIO && usesJasmine:
                return 'webdriverio-jasmine';
            case usesWebdriverIO && usesMocha:
                return 'webdriverio-mocha';
            case usesProtractor && usesCucumber:
                return 'protractor-cucumber';
            case usesProtractor && usesJasmine:
                return 'protractor-jasmine';
            case usesProtractor && usesMocha:
                return 'protractor-mocha';
            case usesPlaywrightTest:
                return 'playwright-test';
            case usesCucumber:
                return 'cucumber';
            case usesJasmine:
                return 'jasmine';
            case usesMocha:
                return 'mocha';
            default:
                throw new ConfigurationError([
                    `Could not determine the test runner used in this project.`,
                    `Supported test runners are Cucumber, Jasmine, Mocha, Playwright Test, Protractor and WebdriverIO.`,
                    `Please install one of these test runners and try again.`,
                ].join(' '));
        }
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
        const stat = await fs.promises.stat(directory);
        if (! stat.isDirectory()) {
            throw new Error(`The path ${ directory } is not a directory or cannot be accessed.`);
        }

        process.chdir(directory);

        try {
            const envinfoResult = await envinfo.run({
                Binaries: [ 'Node', 'npm', 'pnpm', 'yarn' ],
                Languages: [ 'Java' ],
                System: [ 'Container', 'CPU', 'Memory', 'OS', 'Shell' ],
                Utilities: [ 'Git' ],
                npmPackages: `{${ ScanRuntimeEnvironment.packagesOfInterest.join(',') }}`
            }, { json: true, showNotFound: false, console: false, fullTree: true });

            const integrations = JSON.parse(envinfoResult);

            const detectedPackages = Object.keys(integrations.npmPackages || {});

            const serenity = JSON.parse(await envinfo.run({
                npmPackages: this.recommendedSerenityPackages(detectedPackages).join(',')
            }, { json: true, showNotFound: true, console: false, fullTree: true }));

            return {
                ...integrations,
                npmPackages: {
                    ...integrations.npmPackages,
                    ...serenity.npmPackages,
                }
            };
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new ConfigurationError([
                    `Could not analyze the runtime environment of the project at ${ directory }.`,
                    `Please make sure the project's package.json file is valid JSON.`
                ].join(' '), error);
            }
            throw error;
        } finally {
            process.chdir(this.cwd);
        }
    }

    private async isReadableDirectory(directory: string): Promise<boolean> {
        try {
            await fs.promises.access(directory, fs.constants.R_OK);
            const stats = await fs.promises.stat(directory);

            return stats.isDirectory();
        } catch {
            return false;
        }
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
