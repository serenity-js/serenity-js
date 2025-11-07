import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import { Imports } from '../../context/index.js';
import type { CapabilityDescriptor, ImportManifest } from '../../schema.js';
import { ActorNameSchema } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';

const TestAutomationPageElementResolverControllerInputSchema = z.object({
    actorName: ActorNameSchema,
    element: z.object({
        reference: z.string().describe('A reference to the page element to inspect, as obtained from the page snapshot'),
        description: z.string().optional().describe('A brief, human-readable description of the element, e.g., "submit button"'),
    }),
})

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof TestAutomationPageElementResolverControllerInputSchema>;

// todo: standardise the result/instructions/nextSteps structure across all Project controllers
interface TestAutomationPageElementResolverControllerResult {
    result: {
        pageElement: string;
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

export type LocatorType =
    | 'default'
    | 'role'
    | 'text'
    | 'label'
    | 'placeholder'
    | 'alt'
    | 'title'
    | 'test-id'
    | 'nth'
    | 'first'
    | 'last'
    | 'visible'
    | 'has-text'
    | 'has-not-text'
    | 'has'
    | 'hasNot'
    | 'frame'
    | 'frame-locator'
    | 'and'
    | 'or'
    | 'chain';

export type LocatorOptions = {
    attrs?: { name: string, value: string | boolean | number }[],
    exact?: boolean,
    name?: string | RegExp,
    hasText?: string | RegExp,
    hasNotText?: string | RegExp,
};

interface SerializedLocator {
    kind: LocatorType;
    body: string | RegExp;
    options: LocatorOptions;
}

export class TestAutomationPageElementResolverController implements CapabilityController<typeof TestAutomationPageElementResolverControllerInputSchema> {

    public static readonly capabilityPath = [ `inspection`, `page_element_resolver` ];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'Define a selector identifying a page element based on its reference from the accessibility snapshot';

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { actorName, element } = TestAutomationPageElementResolverControllerInputSchema.parse(parameters);

            const imports = new Imports({
                '@serenity-js/core': [ 'Question' ],
                '@serenity-js/web': [ 'Page' ],
                'playwright-core/lib/utils': [ 'asLocator' ],
            });

            // https://github.com/microsoft/playwright/blob/dea31d86d647353ab68ea2e61e425077cbfc200b/packages/playwright/src/mcp/browser/tab.ts#L196
            // https://github.com/microsoft/playwright/blob/4d9e815ebb3cc8be5fda0c18b221ad6d9fe47a43/packages/playwright-core/src/utils/isomorphic/locatorGenerators.ts#L690

            // const snapshot = await context.answerAs(actorName, { imports, value: 'Page.current().nativePage()._snapshotForAI()' });

            const locator: SerializedLocator = await context.answerAs(actorName, {
                imports, value: `Question.about('resolved selector', async actor => {
                const page = await actor.answer(Page.current().nativePage());
                const locator = page.locator('aria-ref=${ element.reference }').first();
                if (! locator) {
                    return 'Element not found';
                }
                
                const { resolvedSelector } = await locator._resolveSelector();
                const jsLocator = asLocator('javascript', resolvedSelector);
                const jsonLanguageLocator = asLocator('jsonl', resolvedSelector);
                
                // return { jsLocator, jsonLanguageLocator };
                return JSON.parse(jsonLanguageLocator);
            })`
            });

            const pageElement = this.pageElementFromLocator(locator, element.description);

            const structuredContent = {
                result: {
                    pageElement,
                },
                instructions: [
                    'Use the provided Serenity/JS page element definition instead of the element reference from the snapshot.',
                    'Use the pageElement as argument to interactions such as Click.on(), Enter.theValue().into(), etc.',
                ]

            }

            return {
                content: [
                    {
                        type: 'text', text: trimmed`
                        | # Element Resolver
                        | 
                        | Element: ${ element.description ?? 'N/A' }
                        | Reference: ${ element.reference }
                        | Selector: ${ locator }
                        | 
                        | ## Serenity/JS Selector
                        |
                        | \`\`\`ts
                        | ${ pageElement.imports ? Object.entries(pageElement.imports).map(([ lib, items ]) => `import { ${ items.join(', ') } } from '${ lib }';`).join('\n') : '// No imports required' }
                        | 
                        | const pageElement = ${ pageElement.question };
                        | \`\`\`
                    `
                    }
                ],
                structuredContent: structuredContent as any,
                isError: false,
                annotations: {
                    title: TestAutomationPageElementResolverController.description,
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: true
                }
            }
        } catch (error) {
            console.warn('RESOLVER ERROR', { error });

            return {
                content: [ { type: 'text', text: String(error) } ],
                isError: true,
                structuredContent: {},
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: TestAutomationPageElementResolverController.capabilityPath,
            description: TestAutomationPageElementResolverController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: TestAutomationPageElementResolverController.toolName,
            description: TestAutomationPageElementResolverController.description,
            inputSchema: zodToJsonSchema(TestAutomationPageElementResolverControllerInputSchema),
            // outputSchema
            annotations: {
                title: TestAutomationPageElementResolverController.description,
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }

    // https://github.com/microsoft/playwright/blob/4d9e815ebb3cc8be5fda0c18b221ad6d9fe47a43/packages/playwright-core/src/utils/isomorphic/locatorGenerators.ts#L279
    private pageElementFromLocator(locator: SerializedLocator, description: string): { question: string; imports: ImportManifest } {
        const imports = new Imports({
            '@serenity-js/web': [ 'By' ],
        });

        const { kind, body, options } = locator;

        switch (kind) {
            case 'default': {
                if (options.hasText !== undefined) {
                    return {
                        imports: imports.merge({
                            '@serenity-js/assertions': [ 'includes' ],
                            '@serenity-js/web': [ 'PageElements', 'Text' ],
                        }).toJSON(),
                        question: `PageElements.located(By.deepCss(${ this.quote(body as string) })).where(Text, includes(${ this.asText(options.hasText) })).first().describedAs(${ this.quote(description ?? body as string) })`,
                    }
                }

                if (options.hasNotText !== undefined) {
                    return {
                        imports: imports.merge({
                            '@serenity-js/assertions': [ 'includes', 'not' ],
                            '@serenity-js/web': [ 'PageElements', 'Text' ],
                        }).toJSON(),
                        question: `PageElements.located(By.deepCss(${ this.quote(body as string) })).where(Text, not(includes(${ this.asText(options.hasText) }))).first().describedAs(${ this.quote(description ?? body as string) })`,
                    }
                }

                return {
                    imports: imports.merge({
                        '@serenity-js/web': [ 'PageElement' ],
                    }).toJSON(),
                    question: `PageElement.located(By.deepCss(${ this.quote(body as string) })).describedAs(${ this.quote(description ?? body as string) })`,
                }
            }

            case 'role': {
                const attrs: string[] = [];
                if (isRegExp(options.name)) {
                    attrs.push(`name: ${ this.regexToSourceString(options.name) }`);
                }
                else if (typeof options.name === 'string') {
                    attrs.push(`name: ${ this.quote(options.name) }`);

                    if (options.exact) {
                        attrs.push(`exact: true`);
                    }
                }
                for (const { name, value } of options.attrs!) {
                    attrs.push(`${ name }: ${ typeof value === 'string' ? this.quote(value) : value }`);
                }

                const attributesString = attrs.length > 0 ? `, { ${ attrs.join(', ') } }` : '';
                return {
                    imports: imports.merge({
                        '@serenity-js/web': [ 'PageElement' ],
                    }).toJSON(),
                    question: `PageElement.located(By.role(${ this.quote(body as string) }${ attributesString })).describedAs(${ this.quote(description ?? body as string) })`,
                };
            }
        }

        throw new Error(`Locator kind "${ kind }" is not yet supported`);
    }

    private quote(text: string) {
        const preferredQuote = `'`;
        return escapeWithQuotes(text, preferredQuote);
    }

    private asText(body: string | RegExp) {
        if (isRegExp(body))
            return this.regexToSourceString(body);
        return this.quote(body);
    }

    private regexToSourceString(re: RegExp) {
        return normalizeEscapedRegexQuotes(String(re));
    }
}

// NOTE: this function should not be used to escape any selectors.
function escapeWithQuotes(text: string, char: string = '\'') {
    const escapedText = JSON.stringify(text).substring(1, JSON.stringify(text).length - 1).replaceAll(/\\"/g, '"');
    if (char === '\'')
        return char + escapedText.replaceAll(/[']/g, '\\\'') + char;
    if (char === '"')
        return char + escapedText.replaceAll(/["]/g, '\\"') + char;
    if (char === '`')
        return char + escapedText.replaceAll(/[`]/g, '\\`') + char;
    throw new Error('Invalid escape char');
}

function isRegExp(value: any): value is RegExp {
    return value instanceof RegExp;
}

function normalizeEscapedRegexQuotes(source: string) {
    // This function reverses the effect of escapeRegexForSelector below.
    // Odd number of backslashes followed by the quote -> remove unneeded backslash.
    return source.replaceAll(/(^|[^\\])(\\\\)*\\(["'`])/g, '$1$2$3');
}
