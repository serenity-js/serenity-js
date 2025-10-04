import { z } from 'zod';

import { defineSchematics } from '../../server/dsl.js';
import { questionParameterSchema } from '../../server/schema.js';

export default defineSchematics({
    namespace: 'serenity',
    moduleName: 'assertions',
    // todo: add mergeable input to avoid having to repeat inputSchema
})({
    description: 'Check if the actual string value includes the expected substring',
    template: 'includes($expected)',
    imports: {
        '@serenity-js/assertions': [ 'includes' ],
    },
    type: 'Question',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
        expected: questionParameterSchema(z.string().describe('The expected string value that the actual value should be compared against, e.g. Ensure.that("Hello world", includes("world"))')),
    }),
}, {
    description: 'Check if the actual value of type T equals the expected value of the same type T',
    template: 'equals($expected)',
    imports: {
        '@serenity-js/assertions': [ 'equals' ],
    },
    type: 'Question',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
        expected: questionParameterSchema(z.string().describe('The expected value that the actual value should be equal to, e.g. Ensure.that("Hello world", equals("Hello world"))')),
    }),
});
