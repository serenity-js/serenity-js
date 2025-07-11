import process from 'node:process';

import type { ImageContent, TextContent } from '@modelcontextprotocol/sdk/types.js';
import type { Actor } from '@serenity-js/core';
import { Cast, Clock, Serenity, TakeNotes } from '@serenity-js/core';
import { TestRunFinished, TestRunFinishes } from '@serenity-js/core/lib/events/index.js';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model/index.js';
import { BrowseTheWebWithPlaywright, SerenitySelectorEngines } from '@serenity-js/playwright';
import * as playwright from 'playwright';

import type { Config } from '../config/Config.js';
import type { Tool } from '../tools/Tool.js';
import type { BrowserConnection } from './BrowserConnection.js';

export class McpSessionContext {
    public clientVersion: { name: string; version: string; } | undefined;
    private serenity: Serenity;

    constructor(tools: Tool[], config: Config, private readonly browserConnection: BrowserConnection) {

    }

    actorCalled(actorName: string): Actor {
        return this.serenity.theActorCalled(actorName);
    }

    async run(tool: Tool, params: Record<string, unknown> | undefined): Promise<{
        content: Array<ImageContent | TextContent>
    }> {
        if (! this.serenity) {
            this.serenity = await this.initialiseSerenity();
        }

        // todo: handler should receive a subset of this class as context; or maybe just the actor?
        const handler = await tool.handler(this, tool.schema.inputSchema.parse(params || {}));

        const { imports, activities, resultOverride, action } = handler;

        if (resultOverride) {
            return resultOverride;
        }

        const output: string[] = [];

        output.push(
            '- Ran Serenity/JS activities:',
            '```ts',
            ... activities.map(activity => `${activity},`),
            '```',
            '',
            '### Required imports',
            '```ts',
            ... Object.entries(imports)
                .map(([ moduleName, moduleImports ]) => `import { ${ moduleImports.sort().join(', ')} } from '${ moduleName }';`),
            '```',
            '',
        )

        const result = action ? await action() : undefined;
        // todo: finish

        const content = result?.['content'] ?? [];

        return {
            content: [
                ...content,
                {
                    type: 'text',
                    text: output.join('\n'),
                }
            ],
        };
    }

    private async initialiseSerenity(): Promise<Serenity> {
        const clock = new Clock();
        const cwd = process.cwd();
        const serenity = new Serenity(clock, cwd);

        const serenitySelectorEngines = new SerenitySelectorEngines();
        await serenitySelectorEngines.ensureRegisteredWith(playwright.selectors);

        const browser = await this.browserConnection.browser();

        serenity.configure({
            actors: Cast.where(actor => actor.whoCan(
                BrowseTheWebWithPlaywright.using(browser),
                TakeNotes.usingAnEmptyNotepad(),
                // todo: consider making `axios` a fixture and injecting an ability to CallAnApi
            )),
        });

        return serenity;
    }

    async close(): Promise<void> {
        this.serenity.announce(new TestRunFinishes(this.serenity.currentTime()))
        await this.serenity.waitForNextCue();
        this.serenity.announce(new TestRunFinished(new ExecutionSuccessful(), this.serenity.currentTime()))

        await this.browserConnection.close();

        this.serenity = undefined;
    }
}
