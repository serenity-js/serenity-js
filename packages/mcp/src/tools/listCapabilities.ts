import { z } from 'zod';

import type { McpSessionContext } from '../server/McpSessionContext.js';
import { defineTool } from './Tool.js';

export const listCapabilities = defineTool({
    schema: {
        name: 'serenity_list_capabilities',
        title: 'List Serenity/JS Capabilities',
        description: 'List all available Serenity/JS capabilities grouped by module (e.g. web, core, rest)',
        outputSchema: z.record(z.record(z.record(z.record(z.string())))),
        type: 'readonly',
    },
    handler: async (context: McpSessionContext) => {
        const structuredContent = {
            web: {
                activities: {
                    navigate: {
                        to: 'Navigate.to(url) - Navigate to a specific URL',
                        back: 'Navigate.back() - Navigate back in the browser history',
                        forward: 'Navigate.forward() - Navigate forward in the browser history',
                        reloadPage: 'Navigate.reloadPage() - Reload the current page',
                    }
                },
            },
        }

        return {
            resultOverride: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(structuredContent, undefined, 2),
                }],
                structuredContent,
            }
        }
    }
})

export default [
    listCapabilities,
];
