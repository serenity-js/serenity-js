import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { JSONObject } from 'tiny-types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../context/index.js';
import type { CapabilityDescriptor } from '../schema.js';
import type { ToolController } from './ToolController.js';

const ListCapabilitiesInputSchema = z.object({}).describe('No input parameters required');
type ListCapabilitiesInput = z.infer<typeof ListCapabilitiesInputSchema>;

export class ListCapabilitiesController implements ToolController<typeof ListCapabilitiesInputSchema> {
    private readonly capabilityMap: JSONObject = {};

    constructor(descriptors: Array<CapabilityDescriptor>) {
        this.capabilityMap = ListCapabilitiesController.calculateCapabilityMap(descriptors);
    }

    private static calculateCapabilityMap(descriptors: Array<CapabilityDescriptor>): JSONObject {
        return descriptors.reduce((map, descriptor) => {
            descriptor.path.reduce((mapSegment, pathSegment, index) => {
                mapSegment[pathSegment] = index === descriptor.path.length - 1
                    ? descriptor.description
                    : mapSegment[pathSegment] || {}
                return mapSegment[pathSegment];
            }, map);

            return map;
        }, {});
    }

    async execute(context: ScreenplayExecutionContext, parameters: ListCapabilitiesInput): Promise<CallToolResult> {
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(this.capabilityMap, undefined, 2),
            }],
            structuredContent: this.capabilityMap,
        }
    }

    // private testAutomationCapabilities(): Record<string, Record<string, Record<string, Record<string, string>>>> {
    //     const capabilities: Record<string, Record<string, Record<string, Record<string, string>>>> = {};
    //
    //     const capabilityTypes = {
    //         'Activity': 'activities',
    //         'Question': 'questions',
    //     }
    //
    //     for (const schematic of this.controllers) {
    //         const moduleName = schematic.moduleName;
    //         const capabilityType = capabilityTypes[schematic.type] ?? 'unknown';
    //
    //         if (!capabilities[moduleName]) {
    //             capabilities[moduleName] = {};
    //         }
    //         if (!capabilities[moduleName][capabilityType]) {
    //             capabilities[moduleName][capabilityType] = {};
    //         }
    //
    //         const descriptor = this.asCapabilityDescriptor(schematic);
    //
    //         if (!capabilities[moduleName][capabilityType][descriptor.group]) {
    //             capabilities[moduleName][capabilityType][descriptor.group] = {};
    //         }
    //         capabilities[moduleName][capabilityType][descriptor.group] = {
    //             ...capabilities[moduleName][capabilityType][descriptor.group],
    //             ...descriptor.capabilities,
    //         };
    //     }
    //
    //     return capabilities;
    // }
    //
    // private asCapabilityDescriptor(schematic: ScreenplaySchematic): { group: string, capabilities: Record<string, string> } {
    //
    //     // Match all method names in the chain
    //     const methods = [...schematic.template.matchAll(/\.(\w+)\s*\(/g)].map(matched => matched[1]);
    //     const methodKey = this.camelCaseToSnakeCase(methods.join('_').trim());
    //
    //     // Match the first object/class before the first dot
    //     const className = (schematic.template.match(/^(\w+)\s*\./) || [])[1];
    //     const methodGroupName = this.camelCaseToSnakeCase(className);
    //
    //     // Join them into a phrase
    //     return {
    //         group: methodGroupName,
    //         capabilities: {
    //             [ methodKey ]: `${ schematic.template } - ${ schematic.description }`,
    //         }
    //     };
    // }
    //
    // private camelCaseToSnakeCase(camelCased: string): string {
    //     return camelCased.replaceAll(/([a-z])([A-Z])/g, '$1_$2').toLocaleLowerCase();
    // }

    toolDescriptor(): Tool {
        return {
            name: 'serenity_list_capabilities',
            description: 'List all available Serenity/JS capabilities grouped by module (e.g. web, core, rest, assertions)',
            inputSchema: zodToJsonSchema(z.object({}).describe('No input parameters required')),
            outputSchema: zodToJsonSchema(
                z.record(
                    z.union([

                        z.record(
                            z.record(
                                z.record(
                                    z.string().describe('capability description')
                                ).describe('capability name')
                            ).describe('capability type')
                        ).describe('Serenity/JS module'),

                        z.record(
                            z.string().describe('capability description')
                        ).describe('capability name')
                    ]),
                ).describe('capability group')
            ),
            annotations: {
                title: 'List Serenity/JS Capabilities',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
