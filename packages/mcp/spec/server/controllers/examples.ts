import { z } from 'zod';

import type { ScreenplaySchematicConfiguration } from '../../../src/server/context/index.js';
import { ScreenplaySchematics } from '../../../src/server/context/index.js';
import { TestAutomationController } from '../../../src/server/controllers/index.js';
import { answerableParameterSchema } from '../../../src/server/schema.js';

export const navigateToSchematicConfiguration: Partial<ScreenplaySchematicConfiguration> = {
    description: 'Navigate to a specific URL in the browser',
    template: 'Navigate.to($url)',
    type: 'Activity',
    inputSchema: z.object({
        actorName: z.string().describe('The name of the actor performing the activity'),
        url: answerableParameterSchema(z.string().describe('The URL to navigate to')),
    }),
}

export function createTestAutomationController(
    schematicConfiguration: Partial<ScreenplaySchematicConfiguration> = navigateToSchematicConfiguration
): TestAutomationController {
    const navigateSchematics = new ScreenplaySchematics({
        namespace: 'serenity',
        moduleName: 'web',
        imports: {
            '@serenity-js/web': [ 'Navigate' ],
        },
    });

    const navigateToSchematic = navigateSchematics.create(schematicConfiguration);

    return new TestAutomationController(
        navigateToSchematic,
    );
}
