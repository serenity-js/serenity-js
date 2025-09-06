import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfigurationError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { createPatch } from 'diff';
import type { CallExpression, ObjectLiteralExpression, ProjectOptions, SourceFile } from 'ts-morph';
import { ExportAssignment, Project, QuoteKind, SyntaxKind } from 'ts-morph';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import type { CapabilityDescriptor, ImportManifest } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';

const ProjectConfigurePlaywrightTestControllerInputSchema = z.object({
    pathToConfigFile: z.string().describe('Absolute path to the Playwright Test configuration file, e.g., `/path/to/project/playwright.config.ts`'),
})

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof ProjectConfigurePlaywrightTestControllerInputSchema>;

// todo: standardise the result/instructions/nextSteps structure across all Project controllers
interface ProjectConfigurePlaywrightTestControllerResult {
    result: {
        patch: string;
    };
    instructions: string[];
    nextSteps: string[];
}

// const ProjectAnalyzeDependenciesControllerOutputSchema = z.object({
//     dependencyScanResult: z.object({
//         dependencies: z.array(z.string().describe('The name of the dependency')),
//         recommendations: z.array(z.string()).describe('Recommended actions to address any detected issues'),
//         nextSteps: z.array(z.string()).describe('Suggested next steps after addressing any detected issues'),
//     }).describe(`The result of scanning the project's Node.js dependencies`),
// });

// type ProjectAnalyzeDependenciesControllerOutput = z.infer<typeof ProjectAnalyzeDependenciesControllerOutputSchema>;

export class ProjectConfigurePlaywrightTestController implements CapabilityController<typeof ProjectConfigurePlaywrightTestControllerInputSchema> {

    public static readonly capabilityPath = [`project`, `configure_playwright_test`];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'Configure Playwright Test for use with Serenity/JS';

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { pathToConfigFile } = ProjectConfigurePlaywrightTestControllerInputSchema.parse(parameters);

            /*
             * TS Config:
             * - Playwright uses automatic TS Config detection
             *  - https://github.com/microsoft/playwright/blob/0cdfc8dd20c11b9ac7c50ac0c96277ebc9318334/packages/playwright/src/third_party/tsconfig-loader.ts
             */
            const options: ProjectOptions = {
                manipulationSettings: { quoteKind: QuoteKind.Single }
            };
            const project = new Project(options);

            const configFile = project.addSourceFileAtPath(pathToConfigFile);

            const originalConfigFileContents = configFile.getFullText();

            this.updateImports(configFile, {
                '@serenity-js/playwright-test': [ 'SerenityFixtures', 'SerenityWorkerFixtures' ],
            } as ImportManifest);

            this.updateTestApiTypes(configFile, [ 'SerenityFixtures', 'SerenityWorkerFixtures' ]);

            this.updateReporter(configFile);

            this.updateFixtureDefaults(configFile);

            const patch = createPatch(configFile.getFilePath(), originalConfigFileContents, configFile.getFullText());

            const result: ProjectConfigurePlaywrightTestControllerResult = {
                result: {
                    patch,
                },
                instructions: [
                    'Apply the proposed diff to the Playwright configuration file',
                ],
                nextSteps: [
                    'If you are happy with the proposed changes, save the updated configuration file.',
                    // 'Install the Serenity/JS packages if you haven\'t already done so:',
                    // `Run your Playwright tests using the ${ this.toolName } tool to verify that everything is working as expected.`,
                    // 'Explore the Serenity/JS documentation to learn how to write tests using the Screenplay Pattern and leverage Serenity/JS capabilities.',
                ],
            };

            return {
                content: [
                    { type: 'text', text: trimmed `
                        | # Configuration update required
                        | 
                        | Update the Playwright configuration file as follows:
                        | \`\`\`diff
                        | ${ patch }
                        | \`\`\`
                    ` },
                ],
                structuredContent: result as any,
                isError: false,
                annotations: {
                    title: ProjectConfigurePlaywrightTestController.description,
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: true
                }
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
            ? [ '@serenity-js/serenity-bdd', { specDirectory: testDirectory } ]
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

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: ProjectConfigurePlaywrightTestController.capabilityPath,
            description: ProjectConfigurePlaywrightTestController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: ProjectConfigurePlaywrightTestController.toolName,
            description: ProjectConfigurePlaywrightTestController.description,
            inputSchema: zodToJsonSchema(ProjectConfigurePlaywrightTestControllerInputSchema),
            // outputSchema
            annotations: {
                title: ProjectConfigurePlaywrightTestController.description,
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
