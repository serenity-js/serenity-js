import fs from 'node:fs';
import os from 'node:os';

import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { Path, trimmed, Version } from '@serenity-js/core/lib/io/index.js';
import envinfo from 'envinfo';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import type { SerenityModuleManager } from '../../integration/index.js';
import type { CapabilityDescriptor } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';
import { ListCapabilitiesController } from '../ListCapabilitiesController.js';
import type { NextStepWithToolCall } from '../NextStep.js';
import { ProjectAnalyzeDependenciesController } from './ProjectAnalyzeDependenciesController.js';
import { ProjectConfigurePlaywrightTestController } from './ProjectConfigurePlaywrightTestController.js';

const ProjectAnalyzeRuntimeEnvironmentControllerInputSchema = z.object({
    rootDirectory: z.string().describe('The root directory of the project to analyze'),
})

type ProjectAnalyzeRuntimeEnvironmentControllerInput = z.infer<typeof ProjectAnalyzeRuntimeEnvironmentControllerInputSchema>;

const ProjectAnalyzeRuntimeEnvironmentControllerOutputSchema = z.object({
    result: z.object({
        status: z.enum([ 'compatible', 'incompatible', 'missing' ]).describe('Overall status of the runtime environment'),
        commands: z.array(z.object({
            name: z.string().describe('The name of the command line tool'),
            binary: z.string().optional().describe('Path to the command line tool binary'),
            version: z.string().optional().describe('The version of the command line tool, if detected'),
            status: z.enum([ 'compatible', 'incompatible', 'missing' ]),
        }).describe('A command line tool required to run Serenity/JS tests')),
        environmentVariables: z.record(z.string()).describe('Environment variables to set for the tools to work as expected'),
    }).describe(`The result of scanning the project's runtime environment`),
    instructions: z.array(z.string()).describe('Recommended actions to address any detected issues'),
    nextSteps: z.array(
        z.object({
            action: z.literal('call_tool'),
            toolName: z.string().describe('The name of the tool to call'),
            reason: z.string().describe('The reason to call the tool'),
        }),
    ),
});

// type ProjectAnalyzeRuntimeEnvironmentControllerOutput = z.infer<typeof ProjectAnalyzeRuntimeEnvironmentControllerOutputSchema>;

type Status = 'compatible' | 'incompatible' | 'missing';

interface CommandLineToolInfo {
    name: string;
    binary?: string;
    version?: string;
    status: Status;
}

// todo: is this duplicating the OutputSchema above?
interface RuntimeScanResult {
    result: {
        status: Status;
        commands: CommandLineToolInfo[];
        environmentVariables: { [name: string]: string }
    }
    instructions: string[];
    nextSteps: Array<NextStepWithToolCall>;
}

export class ProjectAnalyzeRuntimeEnvironmentController implements CapabilityController<typeof ProjectAnalyzeRuntimeEnvironmentControllerInputSchema> {

    public static capabilityPath = [ 'project', 'analyze_runtime_environment' ];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;
    private static description = 'Analyze a Node.js project in the specified root directory to determine compatibility with Serenity/JS. Detect available command line tools. Check for any runtime issues, explains their causes, and provides recommended fixes.';

    constructor(private readonly moduleManager: SerenityModuleManager) {
    }

    private absolute(maybeRelativePath: string): string {
        if (maybeRelativePath.startsWith('~')) {
            return Path.from(os.homedir()).resolve(Path.from('.' + maybeRelativePath.slice(1))).value;
        }

        if (maybeRelativePath.startsWith('.')) {
            return Path.from(process.cwd()).resolve(Path.from(maybeRelativePath)).value;
        }

        return maybeRelativePath;
    }

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

    private async scanProjectRuntime(rootDirectory: string): Promise<RuntimeScanResult> {
        const originalWorkingDirectory = process.cwd();

        // todo: try/catch if the rootDirectory not present or invalid
        process.chdir(rootDirectory);

        const scanResult = JSON.parse(await envinfo.run({
            Binaries: [ 'Node', 'npm', 'pnpm', 'yarn' ],
            Languages: [ 'Java' ],
            System: [ 'Container', 'CPU', 'Memory', 'OS', 'Shell' ],
            Utilities: [ 'Git' ],
        }, { json: true, showNotFound: true, console: false, fullTree: true }));

        process.chdir(originalWorkingDirectory);

        const commands = [];
        const instructions = [];

        if (scanResult.Binaries?.Node) {
            const supportedNodeVersion = await this.moduleManager.supportedNodeVersion();
            const nodeStatus = this.status(scanResult.Binaries.Node.version, supportedNodeVersion);

            const node = {
                name: 'Node.js',
                binary: this.absolute(scanResult.Binaries.Node.path),
                version: scanResult.Binaries.Node.version,
                status: nodeStatus,
            };

            commands.push(node);

            if (nodeStatus !== 'compatible') {
                instructions.push(trimmed`
                    | Incompatible Node.js version detected: ${ scanResult.Binaries.Node.version ?? 'not found' }.
                    | Before proceeding, install a recent Node.js Long-Term Support (LTS) version, e.g. ${ supportedNodeVersion }.
                `);
            }
        }

        let preferredPackageManager: CommandLineToolInfo;

        if (scanResult.Binaries?.pnpm) {
            const pnpm: CommandLineToolInfo = {
                name: 'pnpm',
                binary: this.absolute(scanResult.Binaries.pnpm.path),
                version: scanResult.Binaries.pnpm.version,
                status: 'compatible',
            };

            commands.push(pnpm);

            if (this.fileExists(rootDirectory, 'pnpm-lock.yaml')) {
                preferredPackageManager = pnpm;
            }
        }

        if (scanResult.Binaries?.yarn) {
            const yarn: CommandLineToolInfo = {
                name: 'Yarn',
                binary: this.absolute(scanResult.Binaries.yarn.path),
                version: scanResult.Binaries.yarn.version,
                status: 'compatible',
            };

            commands.push(yarn);

            if (this.fileExists(rootDirectory, 'yarn.lock')) {
                preferredPackageManager = yarn;
            }
        }

        if (scanResult.Binaries?.npm) {
            const npm: CommandLineToolInfo = {
                name: 'npm',
                binary: this.absolute(scanResult.Binaries.npm.path),
                version: scanResult.Binaries.npm.version,
                status: 'compatible',
            };

            commands.push(npm);

            if (! preferredPackageManager) {
                preferredPackageManager = npm;
            }
        }

        instructions.push(trimmed`
        | You are acting as a coding assistant within a JavaScript/TypeScript project.
        | 1. Use: ${ preferredPackageManager.binary } to install any Node.js packages or run npm scripts (${ preferredPackageManager.name } detected at this path).
        | 2. Always use the full command, e.g., \`${ preferredPackageManager.binary } install <package-name>\` or \`${ preferredPackageManager.binary } run <script-name>\`.
        | 3. Always provide the correct command explicitly in your response. Do not mix commands from multiple package managers.
        |`);

        if (scanResult.Utilities?.Git) {
            commands.push({
                name: 'Git',
                binary: this.absolute(scanResult.Utilities.Git.path),
                version: scanResult.Utilities.Git.version,
                status: 'compatible',
            });

            instructions.push(trimmed`
            | This project uses Git. When making any code changes, always ensure that:
            | 1. You create and switch to a new, uniquely named Git branch for the changes created off the latest version of the main branch (e.g., \`main\` or \`master\`)
            | 2. If there are any uncommitted changes in the working directory, prompt the user to review and commit their work before proceeding.
            | 3. Always describe the branch purpose and your planned actions before starting, then confirm with the user."
            |`);
        }

        if (scanResult.Languages?.Java) {
            commands.push({
                name: 'Java',
                binary: this.absolute(scanResult.Languages.Java.path),
                version: scanResult.Languages.Java.version,
                status: 'compatible',   // todo: check the actual version against the expected one
            });
        }

        const nextSteps: NextStepWithToolCall[] = [];

        nextSteps.push({
            action: 'call_tool',
            toolName: ProjectAnalyzeDependenciesController.toolName,
            reason: 'Determine what Serenity/JS packages you need to install',
        }, {
            action: 'call_tool',
            toolName: ListCapabilitiesController.toolName,
            reason: 'Learn about available Serenity/JS capabilities',
        }, {
            action: 'call_tool',
            toolName: ProjectConfigurePlaywrightTestController.toolName,
            reason: 'Configure Playwright to use Serenity/JS',
        });

        const PATH = commands.reduce((acc, tool) => tool.binary ? `${ Path.from(tool.binary).directory().value }:${ acc }` : acc, process.env.PATH ?? '');
        const JAVA_HOME = scanResult.Languages?.Java?.path ? Path.from(scanResult.Languages.Java.path).directory().directory().value : (process.env.JAVA_HOME ?? '');

        const environmentVariables = {
            ...process.env,
            PATH,
            JAVA_HOME,
        }

        instructions.push(trimmed`
            | When invoking command line tools, set the following environment variables:
            | \`\`\`
            | PATH=${PATH}
            | \`\`\`
            |`
        );

        return {
            result: {
                status: commands.every(tool => tool.status === 'compatible') ? 'compatible' : 'incompatible',
                commands,
                environmentVariables,
            },
            instructions,
            nextSteps,
        }
    }

    private fileExists(...pathSegments: string[]): boolean {
        try {
            return fs.existsSync(Path.from(...pathSegments).value);
        }
        catch {
            return false;
        }
    }

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeRuntimeEnvironmentControllerInput): Promise<CallToolResult> {
        try {
            const { rootDirectory } = ProjectAnalyzeRuntimeEnvironmentControllerInputSchema.parse(parameters);

            const structuredContent = await this.scanProjectRuntime(rootDirectory);

            return {
                content: [
                    { type: 'text', text: JSON.stringify(structuredContent, undefined, 0) },
                ],
                structuredContent: {
                    result: structuredContent.result,
                    instructions: structuredContent.instructions,
                    nextSteps: structuredContent.nextSteps,
                },
            }
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: String(error) }],
                isError: true,
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: ProjectAnalyzeRuntimeEnvironmentController.capabilityPath,
            description: ProjectAnalyzeRuntimeEnvironmentController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: ProjectAnalyzeRuntimeEnvironmentController.toolName,
            description: ProjectAnalyzeRuntimeEnvironmentController.description,
            inputSchema: zodToJsonSchema(ProjectAnalyzeRuntimeEnvironmentControllerInputSchema),
            outputSchema: zodToJsonSchema(ProjectAnalyzeRuntimeEnvironmentControllerOutputSchema),
            annotations: {
                title: 'Analyze project runtime',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
