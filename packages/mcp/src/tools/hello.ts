import { z } from 'zod';

import type { McpSessionContext } from '../server/McpSessionContext.js';
import { defineTool } from './Tool.js';

export const hello = defineTool({
    schema: {
        name: 'serenity_hello',
        title: 'Greeter',
        description: 'Greets a person by name',
        inputSchema: z.object({
            name: z.string().describe('The name to greet'),
        }),
        type: 'readonly',
    },
    // todo: actor should be passed to the handle method
    handler: async (context: McpSessionContext, params) => {
        const structuredContent = {
            message: `Hello, ${ params.name }!`,
        }
        return {
            imports: {},
            activities: [],
            resultOverride: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(structuredContent, undefined, 2),
                }]
            }
        }
    }
})

export default [
    hello,
];

//
//
// server.registerTool(
//     'serenity_hello',
//     {
//         title: 'Hello Tool',
//         description: 'A simple tool that says hello',
//         inputSchema: { // } z.object({
//             name: z.string().describe('The name to greet'),
//         }, //),
//         outputSchema: {
//             message: z.string().describe('The greeting message'),
//         },
//         // type: 'readOnly',
//     },
//     async ({ name }) => {
//         const structuredContent = {
//             message: `Hello, ${ name }!`,
//         }
//
//         return {
//             content: [{
//                 type: 'text',
//                 text: JSON.stringify(structuredContent, undefined, 2),
//             }],
//             structuredContent
//         };
//     })
