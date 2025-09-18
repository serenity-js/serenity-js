import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext, ScreenplaySchematic} from '../../context/index.js';
import { ScreenplayTemplate } from '../../context/index.js';
import type { CapabilityDescriptor, InputSchema } from '../../schema.js';
import type { CapabilityController } from '../CapabilityController.js';

export class TestAutomationController<Input extends InputSchema = InputSchema> implements CapabilityController<Input> {

    constructor(private readonly schematic: ScreenplaySchematic<Input>) {
    }

    async execute(
        context: ScreenplayExecutionContext,
        parameters: z.infer<Input>,
    ): Promise<CallToolResult> {

        try {
            const parsedParameters = this.schematic.inputSchema.parse(parameters);

            // todo: InputSchema should require the actorName to be present
            const actorName = parsedParameters['actorName'];

            const template = new ScreenplayTemplate(
                this.schematic.imports,
                this.schematic.template,
            ).compile(parsedParameters);

            // TODO: for questions, return the template
            if (this.schematic.type === 'Activity') {
                await context.performAsActivity(actorName, template);

                return {
                    // todo: produce human-readable content
                    content: [],
                    structuredContent: {
                        result: {
                            activity: {
                                imports: template.imports.toJSON(),
                                template: template.value,
                            }
                        }
                    }
                }
            }

            return {
                // todo: produce human-readable content
                content: [],
                structuredContent: {
                    result: {
                        question: {
                            imports: template.imports.toJSON(),
                            template: template.value,
                        }
                    }
                }
            }
        }
        catch (error) {
            console.warn({ error });

            return {
                content: [
                    { type: 'text', text: error instanceof Error ? error.message : String(error) }
                ],
                structuredContent: {
                    error: error instanceof Error ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                    } : String(error)
                },
                isError: true,
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: [ 'test_automation', ...this.schematic.capabilityPath ],
            description: `${ this.schematic.template } - ${ this.schematic.description }`,
        }
    }

    toolDescriptor(): Tool {
        return {
            name: this.schematic.toolName,
            description: this.schematic.description,
            inputSchema: zodToJsonSchema(this.schematic.inputSchema),
            annotations: {
                title: this.schematic.title,
                readOnlyHint: this.schematic.effect === 'readonly',
                destructiveHint: this.schematic.effect === 'destructive',
                openWorldHint: true,
            },
        } as Tool;
    }
}
