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
    public static toolName = 'serenity_list_capabilities';

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

    toolDescriptor(): Tool {
        return {
            name: ListCapabilitiesController.toolName,
            description: 'List all available Serenity/JS capabilities grouped by module (e.g. web, core, rest, assertions). This tool should be called before using any other tools.',
            inputSchema: zodToJsonSchema(z.object({}).describe('No input parameters required')),
            // outputSchema: zodToJsonSchema(
            //     z.record(
            //         z.union([
            //
            //             z.record(
            //                 z.record(
            //                     z.record(
            //                         z.string().describe('capability description')
            //                     ).describe('capability name')
            //                 ).describe('capability type')
            //             ).describe('Serenity/JS module'),
            //
            //             z.record(
            //                 z.string().describe('capability description')
            //             ).describe('capability name')
            //         ]),
            //     ).describe('capability group')
            // ),
            annotations: {
                title: 'List Serenity/JS Capabilities',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
