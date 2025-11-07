import { z } from 'zod';

import { defineSchematics } from '../../server/dsl.js';
import { questionParameterSchema } from '../../server/schema.js';

export default defineSchematics({
    namespace: 'serenity',
    moduleName: 'assertions',
    imports: {
        '@serenity-js/assertions': [ 'Ensure' ],
    },
    // todo: add mergeable input to avoid having to repeat inputSchema
})({
    description: 'Verify if the resolved value of the provided question meets the specified expectation',
    template: 'Ensure.that($actual, $expectation)',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
        actual: questionParameterSchema(z.string().describe('The question to be asserted on, e.g. Text.of(pageElement)')),
        expectation: questionParameterSchema(z.string().describe('The expectation to be met, e.g. equals("Hello!")')),
    }),
});
