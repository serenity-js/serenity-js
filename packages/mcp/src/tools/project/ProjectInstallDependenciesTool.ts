import { z } from 'zod';

import type { Instruction, Request, Response, ToolConfig, ToolDependencies } from '../../mcp/index.js';
import { CallToolInstruction, RequestUserActionInstruction, Tool } from '../../mcp/index.js';
import type { RuntimeEnvironmentScan } from '../../screenplay/index.js';
import { ScanRuntimeEnvironment } from '../../screenplay/index.js';
import type { CliCommand, PackageManager } from '../../server/integration/index.js';
import { Npm, Pnpm, Yarn } from '../../server/integration/index.js';
import { packageSchema } from './schema.js';

const inputSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
});

const resultSchema = z.object({
    packages: z.array(packageSchema).describe('A list of Node.js packages required by Serenity/JS and their compatibility status post installation'),
    command: z.string().describe('The command that was executed to install the dependencies'),
    stderr: z.string().optional().describe('Standard error output from the package manager, if any'),
    stdout: z.string().optional().describe('Standard output from the package manager, if any'),
});

export class ProjectInstallDependenciesTool extends Tool<typeof inputSchema, typeof resultSchema> {

    constructor(dependencies: ToolDependencies, config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {}) {
        super(dependencies, {
            ...config,
            description: [
                'Install any missing and update any incompatible Node.js packages in the project located in the specified root directory.',
            ].join(' '),
            inputSchema: inputSchema,
            resultSchema: resultSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
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

        const scanResult = await scanner.scan(rootDirectory);

        const packageManager = this.packageManager(scanResult);

        const packagesToInstall = scanResult.packages.filter(pkg => pkg.status === 'missing' || pkg.status === 'incompatible');
        const packageDetails = packagesToInstall.map(pkg => `${ pkg.name }@${ pkg.version.supported }`);

        const scope = 'development';
        const installCommand = packageManager.install(packageDetails, { scope });

        const confirmation = await this.input.confirm([
            `The project requires ${ packagesToInstall.length } ${ scope } ${ packagesToInstall.length === 1 ? 'package' : 'packages' }`,
            `to be installed with ${ scanResult.packageManager.name }.`,
            `Would you like to proceed?`,
        ].join(' '));

        if (! confirmation) {

            // no packages to install
            return response
                .withResult({
                    command: installCommand.toString(),
                    packages: scanResult.packages
                })
                .withInstructions(
                    this.manualInstallationInstruction('Installation aborted', installCommand),
                );
        }

        const { stdout, stderr, error } = await installCommand.execute();

        const after = await scanner.scan(rootDirectory);

        const responseWithResult = response.withResult({
            command: installCommand.toString(),
            packages: after.packages,
            stderr,
            stdout,
        });

        if (error) {
            return responseWithResult
                .withError(error)
                .withInstructions(this.manualInstallationInstruction('Installation failed', installCommand));
        }

        return responseWithResult
            .withInstructions(
                new CallToolInstruction('serenity_project_configure', 'Configure the project to use Serenity/JS'),
            )
    }

    private manualInstallationInstruction(failureReason: string, command: CliCommand): Instruction {
        return new RequestUserActionInstruction(
            'runtime',
            `${ failureReason }. Install the missing packages using the provided command: ${ command.toString() }`
        );
    }

    private packageManager(scanResult: RuntimeEnvironmentScan): PackageManager {
        const { packageManager, rootDirectory, environmentVariables, shell } = scanResult;

        if (packageManager.status !== 'compatible') {
            throw new Error([
                `Cannot install dependencies: incompatible or missing package manager:`,
                packageManager.name,
                packageManager.version.current ?? ''
            ].join(' ').trim());
        }

        switch (packageManager.name) {
            case 'pnpm':
                return new Pnpm(packageManager.path, {
                    cwd: rootDirectory,
                    env: environmentVariables,
                    shell: shell.path,
                });

            case 'yarn':
                return new Yarn(packageManager.path, {
                    cwd: rootDirectory,
                    env: environmentVariables,
                    shell: shell.path,
                });

            default:
                return new Npm(packageManager.path, {
                    cwd: rootDirectory,
                    env: environmentVariables,
                    shell: shell.path,
                });
        }
    }
}
