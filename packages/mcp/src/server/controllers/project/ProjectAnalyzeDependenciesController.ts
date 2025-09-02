import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { trimmed, Version } from '@serenity-js/core/lib/io/index.js';
import envinfo from 'envinfo';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import type { SerenityModuleManager } from '../../integration/index.js';
import type { CapabilityDescriptor } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';
import { ListCapabilitiesController } from '../ListCapabilitiesController.js';

const ProjectAnalyzeDependenciesControllerInputSchema = z.object({
    rootDirectory: z.string().describe('The root directory of the project to analyze'),
})

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof ProjectAnalyzeDependenciesControllerInputSchema>;

// todo: extract common status type
type Status = 'compatible' | 'incompatible' | 'missing';

type DependencyScanResult = Record<string, { currentVersion: string }>;

interface ProjectAnalyzeRuntimeEnvironmentControllerResult {
    dependencies: string[];
    recommendations: string[];
    nextSteps?: string[];
}

// const ProjectAnalyzeDependenciesControllerOutputSchema = z.object({
//     dependencyScanResult: z.object({
//         dependencies: z.array(z.string().describe('The name of the dependency')),
//         recommendations: z.array(z.string()).describe('Recommended actions to address any detected issues'),
//         nextSteps: z.array(z.string()).describe('Suggested next steps after addressing any detected issues'),
//     }).describe(`The result of scanning the project's Node.js dependencies`),
// });

// type ProjectAnalyzeDependenciesControllerOutput = z.infer<typeof ProjectAnalyzeDependenciesControllerOutputSchema>;

type Framework =
    'cucumber' |
    'jasmine' |
    'mocha' |
    'playwright-test' |
    'playwright' |
    'webdriverio' |
    'webdriverio-8' |
    'protractor' |
    'unknown';

export class ProjectAnalyzeDependenciesController implements CapabilityController<typeof ProjectAnalyzeDependenciesControllerInputSchema> {

    public static readonly capabilityPath = [`project`, `analyze_dependencies`];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'List the Node.js packages used by the project in the specified root directory to determine compatibility with Serenity/JS. Check for compatibility issues and recommend any missing packages that should be installed.';

    constructor(private readonly moduleManager: SerenityModuleManager) {
    }

    // todo: extract a shared object for determining the compatibility
    private status(actualVersion: string | undefined, expectedVersionOrRange: string | undefined): Status {
        if (! actualVersion) {
            return 'missing';
        }

        if (! expectedVersionOrRange) {
            return 'compatible';
        }

        try {
            return Version.fromJSON(actualVersion).satisfies(expectedVersionOrRange)
                ? 'compatible'
                : 'incompatible';
        }
        catch {
            return 'incompatible';
        }
    }

    private async findDependencies(rootDirectory: string): Promise<DependencyScanResult> {
        const originalWorkingDirectory = process.cwd();

        // todo: try/catch if the rootDirectory not present or invalid
        process.chdir(rootDirectory);

        const scanResult = JSON.parse(await envinfo.run({
            npmPackages: `{${ [
                '@serenity-js/*',
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
                'npm-failsafe',
                'rimraf',
            ].join(',') }}`,
        }, { json: true, showNotFound: true, console: false, fullTree: true }));

        process.chdir(originalWorkingDirectory);

        const dependencies: Record<string, { currentVersion: string }> = {};

        for (const [ name, info ] of Object.entries(scanResult.npmPackages || {})) {
            dependencies[name] = { currentVersion: info['installed'] };
        }

        return dependencies;
    }

    private detectFrameworks(dependencies: DependencyScanResult): Framework[] {
        const frameworks: Framework[] = [];

        if (dependencies['@cucumber/cucumber'] || dependencies['cucumber']) {
            frameworks.push('cucumber');
        }
        if (dependencies['jasmine']) {
            frameworks.push('jasmine');
        }
        if (dependencies['mocha']) {
            frameworks.push('mocha');
        }
        if (dependencies['@playwright/test']) {
            frameworks.push('playwright-test', 'playwright');
        }
        if (dependencies['playwright']) {
            frameworks.push('playwright');
        }
        if (dependencies['webdriverio'] && this.status(dependencies['webdriverio'].currentVersion, '8.x') === 'compatible') {
            frameworks.push('webdriverio-8');
        }
        if (dependencies['webdriverio'] && this.status(dependencies['webdriverio'].currentVersion, '8.x') === 'incompatible') {
            frameworks.push('webdriverio');
        }
        if (dependencies['protractor']) {
            frameworks.push('protractor');
        }

        return [... new Set(frameworks)].sort() as Framework[];
    }

    private async recommendDependenciesToInstall(frameworks: Framework[], dependencies: DependencyScanResult): Promise<string[]> {

        const packages = [
            'npm-failsafe',
            'rimraf',
            '@serenity-js/assertions',
            '@serenity-js/console-reporter',
            '@serenity-js/core',
            '@serenity-js/rest',
            '@serenity-js/serenity-bdd',
        ];

        if (frameworks.includes('cucumber')) {
            packages.push('@serenity-js/cucumber');
        }
        if (frameworks.includes('jasmine')) {
            packages.push('@serenity-js/jasmine');
        }
        if (frameworks.includes('mocha')) {
            packages.push('@serenity-js/mocha');
        }
        if (frameworks.includes('playwright-test')) {
            packages.push('@serenity-js/playwright-test', '@serenity-js/web');
        }

        if (frameworks.includes('playwright')) {
            packages.push('@serenity-js/playwright', '@serenity-js/web');
        }

        if (frameworks.includes('webdriverio-8')) {
            packages.push('@serenity-js/webdriverio-8', '@serenity-js/web');
        }

        if (frameworks.includes('webdriverio')) {
            packages.push('@serenity-js/webdriverio', '@serenity-js/web');
        }

        if (frameworks.includes('protractor')) {
            packages.push('@serenity-js/protractor', '@serenity-js/web');
        }

        // todo: add local-server, if any of the web frameworks detected

        // const dependenciesToInstall = [];
        //
        // for (const [ dependencyName, { currentVersion } ] of Object.entries(dependencies)) {
        //
        //     const recommendedVersion = dependencyName.startsWith('@serenity-js/')
        //         ? await this.moduleManager.versionOf(dependencyName)
        //         : await this.moduleManager.supportedVersionOf(dependencyName);
        //
        //     if (this.status(currentVersion, recommendedVersion) !== 'compatible') {
        //         dependenciesToInstall.push(dependencyName);
        //     }
        // }

        return packages;

        // return [...new Set(dependenciesToInstall)].sort();
    }

    private noSupportedTestFrameworkDetected(rootDirectory: string): CallToolResult {
        return {
            content: [{ type: 'text', text: trimmed `
                | # No supported test framework detected
                |
                | No compatible test automation framework was found in the project at \`${rootDirectory}\`.
                |
                | ## Supported frameworks
                |
                | Serenity/JS integrates with: Playwright Test, WebdriverIO, Cucumber, Mocha, Jasmine, and Protractor.
                |
                | ## Next steps
                |
                | Choose a framework to get started with test automation.
            ` }],
            isError: false,
            structuredContent: {
                analysisResult: {
                    status: 'no_framework_detected',
                    rootDirectory,
                    supportedFrameworks: [
                        'playwright-test',
                        'webdriverio',
                        'cucumber',
                        'mocha',
                        'jasmine',
                        'protractor'
                    ]
                },
                initializationOptions: [
                    {
                        framework: 'playwright-test',
                        command: 'npm init playwright@latest',
                        description: 'Modern end-to-end testing framework (recommended)',
                        benefits: ['Fast execution', 'Built-in test runner', 'Cross-browser support']
                    },
                    {
                        framework: 'webdriverio',
                        command: 'npm init wdio@latest',
                        description: 'Mature WebDriver-based automation framework',
                        benefits: ['Extensive ecosystem', 'Mobile testing support', 'Flexible configuration']
                    },
                    {
                        framework: 'cucumber',
                        command: 'npm install --save-dev @cucumber/cucumber',
                        description: 'Behavior driven development-based collaboration framework',
                        benefits: ['Gherkin syntax', 'Business-readable test scenarios', 'Living documentation']
                    }
                ],
                recommendations: [
                    'Start with Playwright Test if you\'re new to test automation',
                    'Consider your team\'s existing expertise when choosing a framework',
                    'Review Serenity/JS documentation at https://serenity-js.org/handbook/test-runners/ for framework-specific setup guides'
                ]
            },
        }

    }

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { rootDirectory } = ProjectAnalyzeDependenciesControllerInputSchema.parse(parameters);

            const detectedDependencies = await this.findDependencies(rootDirectory);
            const frameworks = this.detectFrameworks(detectedDependencies);

            if (frameworks.length === 0) {
                return this.noSupportedTestFrameworkDetected(rootDirectory);
            }

            const recommendedDependencies = await this.recommendDependenciesToInstall(frameworks, detectedDependencies);

            const recommendations: string[] = [
                `Install the following dev packages using the preferred package manager:`,
                ...recommendedDependencies.map(dependencyName => `- ${ dependencyName }`),
            ];

            const nextSteps: string[] = [
                trimmed `
                    | Once the recommended dependencies are installed:
                    | - Learn more about available Serenity/JS capabilities by calling ${ ListCapabilitiesController.toolName }
                    |`,
                // todo: configure the project
            ];

            const summary = trimmed `
                | # Project dependency analysis completed
                |
                | ${ recommendedDependencies.length === 0 ? 'All required dependencies are installed and compatible.' : 'Some dependencies are missing or incompatible.' }
                |
                | ## Detected frameworks
                |
                | ${ frameworks.map(f => `- ${ f }`).join('\n') }
                |
                | ## Recommendations
                | 
                | ${ recommendations.join('\n') }
                |
                | ## Next steps
                |
                | ${ nextSteps.join('\n') }|
            `

            return {
                // todo: produce human-readable content
                content: [{ type: 'text', text: summary }],
                structuredContent: {
                    dependencyScanResult: {
                        dependencies: recommendedDependencies,
                        recommendations,
                        nextSteps,
                    } as ProjectAnalyzeRuntimeEnvironmentControllerResult,
                },
            }
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: String(error) }],
                isError: true,
                structuredContent: {},
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: ProjectAnalyzeDependenciesController.capabilityPath,
            description: ProjectAnalyzeDependenciesController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: ProjectAnalyzeDependenciesController.toolName,
            description: ProjectAnalyzeDependenciesController.description,
            inputSchema: zodToJsonSchema(ProjectAnalyzeDependenciesControllerInputSchema),
            // outputSchema
            annotations: {
                title: 'Analyze project runtime',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
