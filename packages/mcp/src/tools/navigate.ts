import { Navigate } from '@serenity-js/web';
import { z } from 'zod';

import type { McpSessionContext } from '../server/McpSessionContext.js';
import { defineTool } from './Tool.js';

const imports = {
    '@serenity-js/web': [ 'Navigate' ],
};

export default [
    defineTool({
        schema: {
            name: 'serenity_web_navigate_to',
            title: 'Navigate.to(url)',
            description: 'Navigate to a specific URL in the browser',
            inputSchema: z.object({
                actorName: z.string().describe('The name of the actor performing the activity'),
                url: z.string().describe('The URL to navigate to'),
            }),
            type: 'destructive',
        },
        handler: async (context: McpSessionContext, params) => {

            await context.actorCalled(params.actorName).attemptsTo(
                Navigate.to(params.url),
            );

            return {
                actor: params.actorName,
                imports,
                activities: [
                    `Navigate.to(${ params.url })`,
                ],
            }
        }
    }),

    defineTool({
        schema: {
            name: 'serenity_web_navigate_back',
            title: 'Navigate.back()',
            description: 'Navigate back in the browser history',
            inputSchema: z.object({
                actorName: z.string().describe('The name of the actor performing the activity'),
            }),
            type: 'destructive',
        },
        handler: async (context: McpSessionContext, params) => {

            await context.actorCalled(params.actorName).attemptsTo(
                Navigate.back(),
            );

            return {
                actor: params.actorName,
                imports,
                activities: [
                    `Navigate.back()`,
                ],
            }
        }
    }),

    defineTool({
        schema: {
            name: 'serenity_web_navigate_forward',
            title: 'Navigate.back()',
            description: 'Navigate forward in the browser history',
            inputSchema: z.object({
                actorName: z.string().describe('The name of the actor performing the activity'),
            }),
            type: 'destructive',
        },
        handler: async (context: McpSessionContext, params) => {

            await context.actorCalled(params.actorName).attemptsTo(
                Navigate.forward(),
            );

            return {
                actor: params.actorName,
                imports,
                activities: [
                    `Navigate.forward()`,
                ],
            }
        }
    }),

    defineTool({
        schema: {
            name: 'serenity_web_navigate_reload_page',
            title: 'Navigate.reloadPage()',
            description: 'Reload the current page in the browser',
            inputSchema: z.object({
                actorName: z.string().describe('The name of the actor performing the activity'),
            }),
            type: 'destructive',
        },
        handler: async (context: McpSessionContext, params) => {

            await context.actorCalled(params.actorName).attemptsTo(
                Navigate.forward(),
            );

            return {
                actor: params.actorName,
                imports,
                activities: [
                    `Navigate.reloadPage()`,
                ],
            }
        }
    }),
];
