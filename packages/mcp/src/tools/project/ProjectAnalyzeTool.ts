import { z } from 'zod';

import type {
    Request,
    Response,
    ToolConfig,
    ToolDependencies
} from '../../mcp/index.js';
import {
    CallToolInstruction,
    RequestUserActionInstruction
} from '../../mcp/index.js';
import { Tool } from '../../mcp/index.js';
import { ScanRuntimeEnvironment } from '../../screenplay/index.js';

const inputSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
});

const versionSchema = z.object({
    current: z.string().optional().describe('Current version, if detected'),
    supported: z.string().optional().describe('Supported version'),
});

const commandSchema = z.object({
    name: z.string().describe('The name of the command line tool'),
    status: z.enum([ 'compatible', 'incompatible', 'missing' ]),
    path: z.string().describe('The absolute path to the command line tool binary'),
    version: versionSchema,
});

const packageSchema = z.object({
    name: z.string().describe('The name of the Node.js package'),
    status: z.enum([ 'compatible', 'incompatible', 'missing' ]),
    version: versionSchema,
});

const resultSchema = z.object({
    status: z.enum([ 'compatible', 'runtime-issues', 'dependency-issues' ])
        .describe([
            'The overall compatibility status of the project:',
            '- compatible - means all runtime and node dependencies are present;',
            '- runtime-issues - means system-level runtime issues that must be resolved before proceeding;',
            '- dependency-issues - some required node modules are missing or need to be updated;',
        ].join(' ')),

    git: commandSchema,
    java: commandSchema,
    node: commandSchema,
    packageManager: commandSchema,
    packages: z.array(packageSchema),
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
        });
    }

    protected async handle(
        request: Request<z.infer<typeof inputSchema>>,
        response: Response<z.infer<typeof resultSchema>>
    ): Promise<Response<z.infer<typeof resultSchema>>> {

        const { rootDirectory } = request.parameters;

        const scanner = ScanRuntimeEnvironment.as(this.actor());

        const result = await scanner.scan(rootDirectory);

        if (result.status === 'dependency-issues') {
            response.withInstructions(new CallToolInstruction('serenity_project_setup', 'Update outdated and install missing dependencies before proceeding'));
        }

        if (result.status === 'runtime-issues') {
            response.withInstructions(new RequestUserActionInstruction('runtime', 'Correct runtime issues before proceeding'));
        }

        return response.withResult(result);
    }
}
