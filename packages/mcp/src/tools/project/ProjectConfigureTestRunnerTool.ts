import { ConfigurationError } from '@serenity-js/core';
import { FileFinder, Path, trimmed } from '@serenity-js/core/lib/io/index.js';
import { createPatch } from 'diff';
import type { CallExpression, ObjectLiteralExpression, SourceFile } from 'ts-morph';
import { ExportAssignment, Project, QuoteKind, SyntaxKind } from 'ts-morph';
import { z } from 'zod';

import type { Request, Response, ToolConfig, ToolDependencies } from '../../mcp/index.js';
import { CallToolInstruction, Tool } from '../../mcp/index.js';
import type { ImportManifest } from '../../server/schema.js';
import { DryRunSchema, TestRunnerNameSchema } from './schema.js';

const inputSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to configure'),
    testRunner: TestRunnerNameSchema.describe('The test runner used by the project, as detected by the serenity_project_analyze tool'),
    dryRun: DryRunSchema,
});

const resultSchema = z.object({
    pathToConfigurationFile: z.string().describe('The absolute path to the configuration file that was created or updated'),
    diff: z.string().describe('A unified diff showing the changes made to the configuration file'),
});

export class ProjectConfigureTestRunnerTool extends Tool<typeof inputSchema, typeof resultSchema> {

    private static runTestsInstruction = new CallToolInstruction(
        'serenity_project_run_tests',
        'Run tests to ensure the project is configured correctly.'
    );

    private static createTestInstruction = new CallToolInstruction(
        'serenity_project_create_test_file',
        'Create a Serenity/JS test file'
    );

    constructor(dependencies: ToolDependencies, config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {}) {
        super(dependencies, {
            ...config,
            description: [
                'Configure the detected test runner in the project located in the specified root directory.',
                'This may involve creating or updating the test runner configuration file to ensure compatibility with Serenity/JS.',
            ].join(' '),
            inputSchema: inputSchema,
            resultSchema: resultSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: true,
                openWorldHint: false,
            }
        });
    }

    protected async handle(
        request: Request<z.infer<typeof inputSchema>>,
        response: Response<z.infer<typeof resultSchema>>
    ): Promise<Response<z.infer<typeof resultSchema>>> {

        if (request.parameters.dryRun) {
            response.withInstructions(
                new CallToolInstruction(
                    this.name(),
                    `To apply the proposed changes, call the ${ this.name() } tool again with dryRun: false`,
                ),
            );
        }

        switch (request.parameters.testRunner) {
            case '@playwright/test':
                return this.configurePlaywrightTest(request.parameters, response);
            default:
                throw new Error(`Configuring ${ request.parameters.testRunner } is not supported yet`)
        }
    }

    private async configurePlaywrightTest(
        parameters: Request<z.infer<typeof inputSchema>>['parameters'],
        response: Response<z.infer<typeof resultSchema>>,
    ): Promise<Response<z.infer<typeof resultSchema>>> {
        const { rootDirectory, dryRun } = parameters;

        const rootDirectoryPath = Path.from(rootDirectory);
        const defaultPathToConfigurationFile = rootDirectoryPath.join(Path.from('playwright.config.ts'));

        // todo: test with .js files
        const candidateConfigurationFilesPaths = this.findFilesMatchingPatterns(rootDirectoryPath, [
            'playwright*.config.{m,c}?{js,ts}',
        ]);

        const pathToConfigurationFile = await this.pickConfigurationFileFrom(
            rootDirectoryPath,
            candidateConfigurationFilesPaths,
            defaultPathToConfigurationFile,
        );

        const playwrightConfigFile = PlaywrightConfigFile.at(pathToConfigurationFile);

        if (dryRun) {
            return response.withResult({
                diff: playwrightConfigFile.diff(),
                pathToConfigurationFile: pathToConfigurationFile.value,
            });
        }

        await playwrightConfigFile.save();

        const diff = playwrightConfigFile.diff();

        return response.withResult({
            diff,
            pathToConfigurationFile: pathToConfigurationFile.value,
        }).withSummary(trimmed`
            | # Test runner configuration updated successfully
            |
            | ## ${ pathToConfigurationFile.value }
            |
            | \`\`\`diff
            | ${ diff }
            | \`\`\`
        `).withInstructions(
            ProjectConfigureTestRunnerTool.runTestsInstruction,
            ProjectConfigureTestRunnerTool.createTestInstruction,
        );
    }

    private async pickConfigurationFileFrom(rootDirectory: Path, candidatePaths: Path[], defaultPath: Path): Promise<Path> {
        if (candidatePaths.length === 0) {
            return defaultPath;
        }

        if (candidatePaths.length === 1) {
            return candidatePaths[0];
        }

        const absolutePaths = new Map(candidatePaths.map(candidatePath => [ rootDirectory.relative(candidatePath).value, candidatePath ]));
        const options = Array.from(absolutePaths.keys()) as unknown as readonly [string, ...string[]];

        const response = await this.input.request('Multiple configuration files found. Select the configuration file to update.', z.object({
            configurationFile: z.enum(options).describe('Configuration file to update'),
        }), { configurationFile: candidatePaths[0].value });

        if (! absolutePaths.has(response.configurationFile)) {
            throw new Error('Invalid configuration file selected. Aborting.');
        }

        return absolutePaths.get(response.configurationFile);
    }

    private findFilesMatchingPatterns(rootDirectory: Path, patterns: string[]): Path[] {
        const finder = new FileFinder(rootDirectory);

        return finder.filesMatching(patterns);
    }
}

class PlaywrightConfigFile {
    static at(pathToFile: Path): PlaywrightConfigFile {
        const project = new Project({
            manipulationSettings: { quoteKind: QuoteKind.Single }
        });

        return new PlaywrightConfigFile(project.addSourceFileAtPath(pathToFile.value));
    }

    private readonly originalContent: string;

    private constructor(private readonly configFile: SourceFile) {
        this.originalContent = this.configFile.getFullText();

        this.updateImports(this.configFile, {
            '@serenity-js/playwright-test': [ 'SerenityFixtures', 'SerenityWorkerFixtures' ],
        } as ImportManifest);

        this.updateTestApiTypes(this.configFile, [ 'SerenityFixtures', 'SerenityWorkerFixtures' ]);
        this.updateReporter(this.configFile);
        this.updateFixtureDefaults(this.configFile);
    }

    diff(): string {
        return createPatch(
            this.configFile.getFilePath(),
            this.originalContent,
            this.configFile.getFullText()
        );
    }

    async save(): Promise<void> {
        await this.configFile.save()
    }

    private getPlaywrightConfigObject(configFile: SourceFile): ObjectLiteralExpression {

        const defaultExportedFunction = this.getDefaultExportedFunction(configFile);

        // The argument to defineConfig should be an object literal expression
        const configObject = defaultExportedFunction.getArguments()[0];
        if (! configObject || ! configObject.isKind(SyntaxKind.ObjectLiteralExpression)) {
            throw new Error('defineConfig argument is not an object.');
        }

        return configObject;
    }

    private getDefaultExportedFunction(configFile: SourceFile): CallExpression {
        const defaultExport = configFile.getExportAssignment(exportAssignment => ! ExportAssignment.isNamespaceExport(exportAssignment));
        if (! defaultExport) {
            throw new ConfigurationError(`No default export found in the Playwright config file at ${ configFile.getFilePath() }`);
        }

        const defaultExportedFunction = defaultExport.getExpressionIfKind(SyntaxKind.CallExpression);
        if (! defaultExportedFunction) {
            throw new Error('Default export is not a function call.');
        }

        return defaultExportedFunction;
    }

    private updateTestApiTypes(configFile: SourceFile, typeArguments: string[]): void {
        const defaultExportedFunction = this.getDefaultExportedFunction(configFile);

        const currentTypeArguments = defaultExportedFunction.getTypeArguments().map(argument => argument.getText());

        for (const [ i, serenityType ] of typeArguments.entries()) {
            if (currentTypeArguments.length > i && ! currentTypeArguments[i].includes(serenityType)) {
                defaultExportedFunction.getTypeArguments()[i]
                    .replaceWithText(`${currentTypeArguments[i]} & ${serenityType}`);
            }
            else {
                defaultExportedFunction.addTypeArgument(serenityType);
            }
        }
    }

    private updateImports(sourceFile: SourceFile, imports: ImportManifest): void {
        for (const [ moduleSpecifier, importSpecifiers ] of Object.entries(imports)) {
            const existingImport = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === moduleSpecifier);
            if (existingImport) {
                const existingImports = new Set(existingImport.getNamedImports().map(n => n.getName()));
                for (const importSpecifier of importSpecifiers) {
                    if (! existingImports.has(importSpecifier)) {
                        existingImport.addNamedImport(importSpecifier);
                    }
                }
            }
            else {
                sourceFile.addImportDeclaration({
                    defaultImport: undefined,
                    namedImports: importSpecifiers,
                    moduleSpecifier,
                });
            }
        }
    }

    private updateReporter(configFile: SourceFile) {
        const config = this.getPlaywrightConfigObject(configFile);

        const testDirectory = (config.getProperty('testDir') as any)?.getInitializer();

        const serenityBddReporter = testDirectory
            ? [ '@serenity-js/serenity-bdd', { specDirectory: this.unquoted(testDirectory.getText()) } ]
            : '@serenity-js/serenity-bdd';

        const serenityReporter = [ '@serenity-js/playwright-test', {
            crew: [
                '@serenity-js/console-reporter',
                serenityBddReporter,
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: './reports/serenity' } ]
            ]
        } ]

        const reporterProp = config.getProperty('reporter');

        if (reporterProp) {
            const initializer = (reporterProp as any).getInitializer();

            if (initializer?.getKind() === SyntaxKind.ArrayLiteralExpression) {
                const arrayInitializer = initializer;
                const items = arrayInitializer.getElements().map(element => element.getText());
                if (! items.some(item => item.includes('@serenity-js/playwright-test'))) {
                    arrayInitializer.insertElement(0, this.asJsonString([
                        serenityReporter
                    ]));
                }
            }
            else {
                const originalReporter = (reporterProp as any).getInitializer().getText().replaceAll(/["']/g, '');

                (reporterProp as any).setInitializer(this.asJsonString([
                    serenityReporter,
                    [ originalReporter ],
                ]));
            }
        }
        else {
            config.addPropertyAssignment({
                name: 'reporter',
                initializer: this.asJsonString([ serenityReporter ]),
            });
        }
    }

    private unquoted(value: string): string {
        return value.replaceAll(/^["']|["']$/g, '');
    }

    private updateFixtureDefaults(configFile: SourceFile) {
        const config = this.getPlaywrightConfigObject(configFile);

        const fixtureDefaults = {
            defaultActorName: 'Alice',
        };

        const useProp = config.getProperty('use');

        if (useProp) {
            const initializer = (useProp as any).getInitializer();

            if (initializer?.getKind() === SyntaxKind.ObjectLiteralExpression) {
                const objectInitializer = initializer as ObjectLiteralExpression;
                for (const [ key, value ] of Object.entries(fixtureDefaults)) {
                    const existingProp = objectInitializer.getProperty(key);
                    if (existingProp) {
                        (existingProp as any).setInitializer(this.asJsonString(value));
                    }
                    else {
                        objectInitializer.addPropertyAssignment({
                            name: key,
                            initializer: this.asJsonString(value),
                        });
                    }
                }
            }
            else {
                throw new ConfigurationError(`Expected the 'use' property in the Playwright config file at ${ configFile.getFilePath() } to be an object.`);
            }
        }
        else {
            config.addPropertyAssignment({
                name: 'use',
                initializer: this.asJsonString(fixtureDefaults),
            });
        }
    }

    private asJsonString(value: any): string {
        return JSON.stringify(value, undefined, 2).replaceAll('"', "'");
    }
}
