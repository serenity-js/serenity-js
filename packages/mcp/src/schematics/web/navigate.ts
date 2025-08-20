import { z } from 'zod';

import { defineSchematics } from '../../server/dsl.js';
import { answerableParameterSchema } from '../../server/schema.js';

export default defineSchematics({
    namespace: 'serenity',
    moduleName: 'web',
    imports: {
        '@serenity-js/web': [ 'Navigate' ],
    },
    // todo: add mergeable input to avoid having to repeat inputSchema
})({
    description: 'Navigate to a specific URL in the browser',
    template: 'Navigate.to($url)',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
        url: answerableParameterSchema(z.string().describe('The URL to navigate to')),
    }),
}, {
    description: 'Navigate back in the browser history',
    template: 'Navigate.back()',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
    }),
}, {
    description: 'Navigate forward in the browser history',
    template: 'Navigate.forward()',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
    }),
}, {
    description: 'Reload the current page in the browser',
    template: 'Navigate.reloadPage()',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
    }),
});
