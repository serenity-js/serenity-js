import { z } from 'zod';

import { defineSchematics } from '../../server/dsl.js';
import { questionParameterSchema } from '../../server/schema.js';

export default defineSchematics({
    namespace: 'serenity',
    moduleName: 'web',
    imports: {
        '@serenity-js/web': [ 'Click' ],
    },
    // todo: add mergeable input to avoid having to repeat inputSchema
})({
    description: 'Click on a page element',
    template: 'Click.on($pageElement)',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
        pageElement: questionParameterSchema(z.string().describe('A reference to the page element to click on, as obtained from the page snapshot')),
    }),
});
