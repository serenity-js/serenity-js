import { ConfigurationError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { z } from 'zod';

import type { Instruction, Request, Response, ToolConfig, ToolDependencies } from '../../mcp/index.js';
import { CallToolInstruction, RequestUserActionInstruction, Tool, UpdatePolicyInstruction } from '../../mcp/index.js';
import type { DependencyMetadata, RuntimeEnvironmentScan } from '../../screenplay/index.js';
import { ScanRuntimeEnvironment } from '../../screenplay/index.js';
import { packageSchema, versionSchema } from './schema.js';

const inputSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
});

const commandSchema = z.object({
    name: z.string().describe('The name of the command line tool'),
    status: z.enum([ 'compatible', 'incompatible', 'missing' ]),
    path: z.string().describe('The absolute path to the command line tool binary'),
    version: versionSchema,
});

const resultSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
    status: z.enum([ 'compatible', 'runtime-issues', 'dependency-issues' ])
        .describe([
            'The overall compatibility status of the project:',
            '- compatible - means all runtime and node dependencies are present;',
            '- runtime-issues - means system- or project-level runtime issues that must be resolved before proceeding;',
            '- dependency-issues - some required node modules are missing or need to be updated;',
        ].join(' ')),
    git: commandSchema,
    java: commandSchema,
    node: commandSchema,
    packageManager: commandSchema,
    shell: commandSchema,
    packages: z.array(packageSchema).describe('A list of Node.js packages required by Serenity/JS and their compatibility status'),
    testRunner: commandSchema,
    environmentVariables: z.record(z.string()).describe('A list of environment variables available in the project'),
});

export class ProjectAnalyzeTool extends Tool<typeof inputSchema, typeof resultSchema> {

    constructor(dependencies: ToolDependencies, config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {}) {
        super(dependencies, {
            ...config,
            description: [
                'Analyze a Node.js project in the specified root directory to assess compatibility with Serenity/JS.',
                'Check for any runtime issues, explain their root causes, and provide recommended fixes.'
            ].join(' '),
            inputSchema: inputSchema,
            resultSchema: resultSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: false,
            }
        });
    }

    protected async handle(
        request: Request<z.infer<typeof inputSchema>>,
        response: Response<z.infer<typeof resultSchema>>
    ): Promise<Response<z.infer<typeof resultSchema>>> {

        const { rootDirectory } = request.parameters;

        const scanner = ScanRuntimeEnvironment.as(this.actor());

        try {
            const result = await scanner.scan(rootDirectory.trim());

            return response
                .withResult(result)
                .withSummary(this.summaryOf(result))
                .withInstructions(...this.instructionsFor(result));
        }
        catch(error) {
            if (error instanceof ConfigurationError) {
                return response
                    .withError(error)
                    .withInstructions(
                        new RequestUserActionInstruction(
                            'runtime',
                            error.message,
                        ),
                    );
            }

            throw error;
        }

    }

    private summaryOf(result: RuntimeEnvironmentScan): string {

        const compatibleCommandLineTools = describeAllCompatible(result.commands);
        const problematicCommandLineTools = describeAllIncompatible(result.commands);

        const compatiblePackages = describeAllCompatible(result.packages);
        const missingOrOutdatedPackages = describeAllIncompatible(result.packages);

        const testRunner = describeTestRunner(result.testRunner);

        return [
            trimmed`
                | # Project analysis result: ${ result.status }
                |
                | ## ${ statusEmoji(result.testRunner.status) } Test runner
                |
                | ${ testRunner }
                |`,
            compatibleCommandLineTools.length > 0 && trimmed`
                | ## ${ statusEmoji('compatible') } Compatible command line tools
                |
                | ${ compatibleCommandLineTools.join('\n') }
                |`,
            problematicCommandLineTools.length > 0 && trimmed`
                | ## ${ statusEmoji('incompatible') } Incompatible command line tools
                |
                | ${ problematicCommandLineTools.join('\n') }
                |`,
            compatiblePackages.length > 0 && trimmed`
                | ## ${ statusEmoji('compatible') } Installed compatible Node.js packages
                |
                | ${ compatiblePackages.join('\n') }
                |`,
            missingOrOutdatedPackages.length > 0 && trimmed`
                | ## ${ statusEmoji('incompatible') } Missing or outdated Node.js packages
                |
                | ${ missingOrOutdatedPackages.join('\n') }
                |`,
            `## ➡️️ Next steps`,
            problematicCommandLineTools.length > 0 && trimmed`
                | - Address the issues with the incompatible or missing command line tools listed above.
                |`,
            missingOrOutdatedPackages.length > 0 && trimmed`
                | - Install or update the Node.js packages listed above using the \`serenity_project_install_dependencies\` tool.
                |`,
            [ ...problematicCommandLineTools, ...missingOrOutdatedPackages].length === 0 && trimmed`
                | - Your project is ready! You can start using Serenity/JS.
                |`,
        ].filter(Boolean).join('\n');
    }

    private instructionsFor(result: RuntimeEnvironmentScan): Instruction[] {
        const instructions: Instruction[] = [];

        if (result.status === 'dependency-issues') {
            const notCompatiblePackages = result.packages.filter(details => details.status !== 'compatible');
            const advice = notCompatiblePackages.reduce((message, packageDetails) => {
                return message + `- ${ packageDetails.name }@${ packageDetails.version.supported }\n`;
            }, `Install the following packages before proceeding:\n`);

            instructions.push(new CallToolInstruction('serenity_project_install_dependencies', advice));
        }

        if (result.status === 'runtime-issues') {
            instructions.push(new RequestUserActionInstruction('runtime', 'Correct runtime issues before proceeding'));
        }

        if (result.testRunner.status !== 'compatible') {
            instructions.push(new RequestUserActionInstruction('runtime', 'Install a supported test runner before proceeding'));
        }

        if (result.packageManager) {
            instructions.push(new UpdatePolicyInstruction('rule', trimmed`
                | You are acting as a coding assistant within a JavaScript/TypeScript project. Always follow these rules:
                |
                | 1. Use the detected package manager
                |   - Use the detected binary for all package installations and script executions: ${ result.packageManager.path }
                |   - Do not use any other package manager.
                |
                | 2. Always write full, copy-ready commands
                |   - Provide commands in full, exactly as they should be executed.
                |   - Example: Install a package → ${ result.packageManager.path } install <package-name>
                |   - Example: Run a script → ${ result.packageManager.path } run <script-name>
                |
                | 3. Be explicit and consistent
                |   - Every response must include the exact command(s) required, with no placeholders omitted.
                |   - Never mix or alternate between package managers.
                |   - Keep command usage consistent across all responses.            
                |`
            ));
        }

        if (result.git) {
            instructions.push(new UpdatePolicyInstruction('rule', trimmed`
                | This project uses Git installed at ${ result.git.path }. When making any code changes, always follow these rules:
                | 1. Branch creation
                |   - Always start from the latest main (or master) branch.
                |   - Create and switch to a new branch with a unique, descriptive name (e.g., feature/integrate-serenity-js).
                |
                | 2. Working directory check
                |   - If uncommitted changes exist, stop and prompt the user to review, commit, or stash them before continuing.
                |
                | 3. Branch purpose confirmation
                |   - Before beginning changes, clearly describe the new branch’s purpose and the planned modifications.
                |   - Confirm with the user before proceeding.
                |`
            ));
        }

        return instructions;
    }
}

function describeAllCompatible(deps: DependencyMetadata[]): string[] {
    return deps
        .filter(dep => dep.status === 'compatible')
        .map(dep => `- ${ dep.name } ${ dep.version.current }`);
}

function describeAllIncompatible(deps: DependencyMetadata[]): string[] {
    return deps
        .filter(dep => dep.status !== 'compatible')
        .map(dep => `- ${ dep.name }${ dep.version.current ? ' ' + dep.version.current : '' } (status: ${ dep.status }, supported: ${ dep.version.supported })`);
}

function describeTestRunner(testRunner: DependencyMetadata): string {
    if (testRunner.status === 'missing') {
        return '- ⚠️ No test runner detected';
    }

    if (testRunner.status === 'incompatible') {
        return `- ⚠️ ${ testRunner.name } ${ testRunner.version.current ?? '' } (status: ${ testRunner.status }, supported: ${ testRunner.version.supported })`;
    }

    return `- ✅ ${ testRunner.name } ${ testRunner.version.current }`;
}

function statusEmoji(status: 'compatible' | 'incompatible' | 'missing'): string {
    switch (status) {
        case 'incompatible':
            return '⚠️';
        case 'missing':
            return '❌';
        default:
            return '✅';
    }
}
