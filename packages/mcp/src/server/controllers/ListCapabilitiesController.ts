import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext, ScreenplaySchematic } from '../context/index.js';
import type { Controller } from './Controller.js';

const ListCapabilitiesInputSchema = z.object({}).describe('No input parameters required');
type ListCapabilitiesInput = z.infer<typeof ListCapabilitiesInputSchema>;

export class ListCapabilitiesController implements Controller<typeof ListCapabilitiesInputSchema> {
    constructor(private readonly schematics: Array<ScreenplaySchematic>) {
    }

    async execute(context: ScreenplayExecutionContext, parameters: ListCapabilitiesInput): Promise<CallToolResult> {
        const structuredContent: Record<string, Record<string, Record<string, Record<string, string>>>> = {};

        const capabilityTypes = {
            'Activity': 'activities',
            'Question': 'questions',
        }

        for (const schematic of this.schematics) {
            const moduleName = schematic.moduleName;
            const capabilityType = capabilityTypes[schematic.type] ?? 'unknown';

            if (!structuredContent[moduleName]) {
                structuredContent[moduleName] = {};
            }
            if (!structuredContent[moduleName][capabilityType]) {
                structuredContent[moduleName][capabilityType] = {};
            }

            const descriptor = this.asCapabilityDescriptor(schematic);

            if (!structuredContent[moduleName][capabilityType][descriptor.group]) {
                structuredContent[moduleName][capabilityType][descriptor.group] = {};
            }
            structuredContent[moduleName][capabilityType][descriptor.group] = {
                ...structuredContent[moduleName][capabilityType][descriptor.group],
                ...descriptor.capabilities,
            };
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(structuredContent, undefined, 2),
            }],
            structuredContent,
        }
    }

    private asCapabilityDescriptor(schematic: ScreenplaySchematic): { group: string, capabilities: Record<string, string> } {

        // Match all method names in the chain
        const methods = [...schematic.template.matchAll(/\.(\w+)\s*\(/g)].map(matched => matched[1]);
        const methodKey = this.deCamelCased(methods.join(' ').trim()).toLocaleLowerCase();

        // Match the first object/class before the first dot
        const className = (schematic.template.match(/^(\w+)\s*\./) || [])[1];
        const methodGroupName = this.deCamelCased(className).toLocaleLowerCase();

        // Join them into a phrase
        return {
            group: methodGroupName,
            capabilities: {
                [ methodKey ]: `${ schematic.template } - ${ schematic.description }`,
            }
        };
    }

    private deCamelCased(camelCased: string): string {
        return camelCased.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
    }

    descriptor(): Tool {
        return {
            name: 'serenity_list_capabilities',
            description: 'List all available Serenity/JS capabilities grouped by module (e.g. web, core, rest, assertions)',
            inputSchema: zodToJsonSchema(z.object({}).describe('No input parameters required')),
            outputSchema: zodToJsonSchema(z.record(z.record(z.record(z.record(z.string()))))),
            annotations: {
                title: 'List Serenity/JS Capabilities',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
