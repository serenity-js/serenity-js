import process from 'node:process';

import type { ImageContent, TextContent } from '@modelcontextprotocol/sdk/types.js';
import type { Actor } from '@serenity-js/core';
import { Cast, Clock, Serenity, TakeNotes } from '@serenity-js/core';
import { TestRunFinished, TestRunFinishes } from '@serenity-js/core/lib/events/index.js';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model/index.js';
import { BrowseTheWebWithPlaywright, SerenitySelectorEngines } from '@serenity-js/playwright';
import * as playwright from 'playwright';
import type { z } from 'zod';

import type { Config } from '../config/Config.js';
import type { InputSchema, OutputSchema, Tool } from '../tools/Tool.js';
import type { BrowserConnection } from './BrowserConnection.js';

export class McpSessionContext {
    public clientVersion: { name: string; version: string; } | undefined;
    private serenity: Serenity;

    constructor(tools: Tool[], config: Config, private readonly browserConnection: BrowserConnection) {

    }

    actorCalled(actorName: string): Actor {
        return this.serenity.theActorCalled(actorName);
    }

    async run<Input extends InputSchema, Output extends OutputSchema>(tool: Tool<Input, Output>, params: Record<string, unknown> | undefined): Promise<{
        content: Array<ImageContent | TextContent>,
        structuredContent?: z.output<Output>,
    }> {
        if (! this.serenity) {
            this.serenity = await this.initialiseSerenity();
        }

        // todo: handler should receive a subset of this class as context; or maybe just the actor?
        const handler = await tool.handler(this, tool.schema.inputSchema.parse(params || {}));

        if (handler.resultOverride) {
            return handler.resultOverride;
        }

        const requiredDependencies = Object.keys(handler.imports);
        const requiredDependenciesMarkdown = requiredDependencies.map(dependency => `- \`${dependency}\``).join('\n');

        const requiredImportsMarkdown = Object.entries(handler.imports)
                .map(([ moduleName, moduleImports ]) => {
                    return `import { ${ moduleImports.sort().join(', ')} } from '${ moduleName }';`
                }).join('\n');

        const actorCode = trimmed`
            | await actorCalled('${ handler.actor }').attemptsTo(
            | ${ handler.activities.map(activity => `    ${ activity },\n`).join('') }
            | );`

        const markdownOutput: string[] = [
            `# Serenity/JS Code for ${ tool.schema.name }`,
            '```ts',
            actorCode,
            '```',
            '',
            '## Required dependencies',
            requiredDependenciesMarkdown,
            '',
            '## Required imports',
            '```ts',
            requiredImportsMarkdown,
            '```',
            '',
        ];

        const structuredContent = {
            imports: handler.imports,
            code: actorCode,
        }

        const result = handler.action ? await handler.action() : undefined;
        // todo: finish

        const content = result?.['content'] ?? [];

        return {
            content: [
                ...content,
                {
                    type: 'text',
                    text: markdownOutput.join('\n'),
                }
            ],
            structuredContent: structuredContent,
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
        if (this.serenity) {
            this.serenity.announce(new TestRunFinishes(this.serenity.currentTime()))
            await this.serenity.waitForNextCue();
            this.serenity.announce(new TestRunFinished(new ExecutionSuccessful(), this.serenity.currentTime()));
            this.serenity = undefined;
        }

        await this.browserConnection.close();
    }
}
