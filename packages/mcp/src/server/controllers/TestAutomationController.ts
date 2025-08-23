import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext, ScreenplaySchematic } from '../context/index.js';
import { ScreenplayTemplate } from '../context/index.js';
import type { CapabilityDescriptor, InputSchema } from '../schema.js';
import type { CapabilityController } from './CapabilityController.js';

export class TestAutomationController<Input extends InputSchema = InputSchema> implements CapabilityController<Input> {

    constructor(private readonly schematic: ScreenplaySchematic<Input>) {
    }

    async execute(
        context: ScreenplayExecutionContext,
        parameters: z.infer<Input>,
    ): Promise<CallToolResult> {

        const parsedParameters = this.schematic.inputSchema.parse(parameters);

        // todo: InputSchema should require the actorName to be present
        const actorName = parsedParameters['actorName'];

        const template = new ScreenplayTemplate(
            this.schematic.imports,
            this.schematic.template
        ).compile(parsedParameters);

        // todo: catch errors and report them to the user
        await context.performAsActivity(actorName, template);

        const imports = template.imports.toJSON();
        const dependencies = Object.keys(imports).sort();

        // todo: return "view"

        return {
            // todo: produce human-readable content
            content: [],
            structuredContent: {
                dependencies,
                imports,
                actorName,
                activities: [
                    template.value,
                ]
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
