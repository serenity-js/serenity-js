import { z } from 'zod';

import { defineSchematics } from '../../server/dsl.js';

// todo: add outputSchema to questions
export default defineSchematics({
    namespace: 'serenity',
    moduleName: 'web',
    imports: {
        '@serenity-js/web': [ 'Page' ],
    },
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
    }),
    // todo: add mergeable input to avoid having to repeat inputSchema
})({
    description: 'A question that retrieves the URL of the current page in the browser.',
    template: 'Page.current().url().href',
    type: 'Question',
}, {
    description: 'A question that retrieves the name of the current page in the browser',
    template: 'Page.current().name()',
    type: 'Question',
}, {
    description: 'A question that retrieves the title of the current page in the browser',
    template: 'Page.current().title()',
    type: 'Question',
});
