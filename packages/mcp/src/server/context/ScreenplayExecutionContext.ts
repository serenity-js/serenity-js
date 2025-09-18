import process from 'node:process';
import vm from 'node:vm';

import type { Actor } from '@serenity-js/core';
import { Cast, Clock, Serenity, TakeNotes } from '@serenity-js/core';
import { TestRunFinished, TestRunFinishes } from '@serenity-js/core/lib/events/index.js';
import { ConfigurationError } from '@serenity-js/core/lib/index.js';
import type { ModuleLoader } from '@serenity-js/core/lib/io/index.js';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model/index.js';
import { BrowseTheWebWithPlaywright, SerenitySelectorEngines } from '@serenity-js/playwright';
import * as playwright from 'playwright';

import type { PlaywrightBrowserConnection } from '../integration/PlaywrightBrowserConnection.js';
import type { Imports } from './Imports.js';
import type { CompiledTemplate } from './ScreenplayTemplate.js';

export class ScreenplayExecutionContext {

    private serenity: Serenity;

    constructor(
        private readonly browserConnection: PlaywrightBrowserConnection,
        private readonly moduleLoader: ModuleLoader
    ) {
    }

    async answerAs<T>(actorName: string, template: CompiledTemplate): Promise<T> {
        if (! this.serenity) {
            this.serenity = await this.initialiseSerenity();
        }

        const contextGlobals = {
            ...await this.createVmContextGlobals(template.imports),
            actor: this.actorCalled(actorName),
        };

        const code = `(async () => await actor.answer(${ template.value }))()`

        // todo: catch errors and report them to the user: SyntaxError
        return await vm.runInNewContext(code, contextGlobals);
    }

    async performAsActivity(actorName: string, template: CompiledTemplate): Promise<void> {
        if (! this.serenity) {
            this.serenity = await this.initialiseSerenity();
        }

        const contextGlobals = {
            ...await this.createVmContextGlobals(template.imports),
            actor: this.actorCalled(actorName),
        };

        const code = `(async () => await actor.attemptsTo(${ template.value }))()`

        // todo: catch errors and report them to the user: SyntaxError
        await vm.runInNewContext(code, contextGlobals);
    }

    private async createVmContextGlobals(imports: Imports): Promise<Record<string, any>> {
        const valueImports = imports.withoutTypeImports().toJSON();

        const moduleNames = Object.keys(valueImports);

        const modules = await this.loadModules(moduleNames);

        const contextGlobals: Record<string, any> = {};
        for (const [ moduleName, identifiers ] of Object.entries(valueImports)) {

            const loadedModule = modules[moduleName];

            for (const identifier of identifiers) {
                if (loadedModule[identifier] === undefined) {
                    throw new ConfigurationError(`Module "${moduleName}" does not export "${identifier}"`);
                }
                contextGlobals[identifier] = loadedModule[identifier];
            }
        }

        return contextGlobals;
    }

    private async loadModules(moduleNames: string[]): Promise<Record<string, any>> {
        const missingDependencies = [];

        const loadedModules: Record<string, any> = {};
        for (const moduleName of moduleNames) {
            try {
                loadedModules[moduleName] = await this.moduleLoader.load(moduleName);
            }
            catch (error) {
                if (error?.code.endsWith('MODULE_NOT_FOUND')) {
                    missingDependencies.push(moduleName);
                } else {
                    throw error;
                }
            }
        }
        if (missingDependencies.length > 0) {
            throw new ConfigurationError(`The following dependencies are missing: ${missingDependencies.join(', ')}`);
        }
        return loadedModules;
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
                // todo: add CallAnApi
            )),
        });

        return serenity;
    }

    private actorCalled(actorName: string): Actor {
        return this.serenity.theActorCalled(actorName);
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
