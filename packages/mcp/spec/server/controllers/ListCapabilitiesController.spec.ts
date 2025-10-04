import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { z } from 'zod';

import { ScreenplayExecutionContext } from '../../../src/server/context/index.js';
import { ListCapabilitiesController } from '../../../src/server/controllers/index.js';
import { answerableParameterSchema } from '../../../src/server/schema.js';
import { createTestAutomationController } from './examples.js';

function createListCapabilitiesController() {
    const navigateToController = createTestAutomationController({
        description: 'Navigate to a specific URL in the browser',
        template: 'Navigate.to($url)',
        type: 'Activity',
        inputSchema: z.object({
            actorName: z.string().describe('The name of the actor performing the activity'),
            url: answerableParameterSchema(z.string().describe('The URL to navigate to')),
        }),
    });
    const navigateReloadPageController = createTestAutomationController({
        description: 'Reload the current page in the browser',
        template: 'Navigate.reloadPage()',
        type: 'Activity',
        inputSchema: z.object({
            actorName: z.string().describe('The name of the actor performing the activity'),
        }),
    });

    return new ListCapabilitiesController([
        navigateToController.capabilityDescriptor(),
        navigateReloadPageController.capabilityDescriptor(),
    ]);
}

describe('ListCapabilitiesController', () => {

    describe('execute', () => {

        describe('structured content', () => {

            it('describes the capabilities provided by other controllers', async () => {

                const controller = createListCapabilitiesController();

                const dummyContext = sinon.createStubInstance(ScreenplayExecutionContext)
                const noParameters = {};

                const result = await controller.execute(dummyContext, noParameters);

                expect(result.structuredContent).to.deep.equal({
                    test_automation: {
                        web: {
                            activities: {
                                navigate: {
                                    to: 'Navigate.to($url) - Navigate to a specific URL in the browser',
                                    reload_page: 'Navigate.reloadPage() - Reload the current page in the browser'
                                }
                            }
                        }
                    }
                });
            });
        });
    });

    describe('toolDescriptor', () => {

        it('describes the tool for listing capabilities', async () => {

            const controller = createListCapabilitiesController();

            expect(controller.toolDescriptor()).to.deep.equal({
                name: 'serenity_list_capabilities',
                description: 'List all available Serenity/JS capabilities grouped by module (e.g. web, core, rest, assertions). This tool should be called before using any other tools.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false,
                    description: 'No input parameters required',
                    '$schema': 'http://json-schema.org/draft-07/schema#'
                },
                annotations: {
                    title: 'List Serenity/JS Capabilities',
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: true
                }
            }
            );
        });
    });
});
