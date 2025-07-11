import { Navigate } from '@serenity-js/web';
import { z } from 'zod';

import type { McpSessionContext } from '../server/McpSessionContext.js';
import { defineTool } from './Tool.js';

export const navigateTo = defineTool({
    schema: {
        name: 'serenity_web_navigate_to',
        title: 'Navigate to a URL',
        description: 'Navigate to a URL',
        inputSchema: z.object({
            url: z.string().describe('The URL to navigate to'),
        }),
        type: 'destructive',
    },
    handler: async (context: McpSessionContext, params) => {

        const actorName = 'Alice'; // todo: should be passed as a parameter

        await context.actorCalled(actorName).attemptsTo(
            Navigate.to(params.url),
        );

        return {
            actor: actorName,
            imports: {
                '@serenity-js/web': [ 'Navigate' ],
            },
            activities: [
                `Navigate.to(${ params.url })`,
            ],
        }
    }
})

export default [
    navigateTo,
];
