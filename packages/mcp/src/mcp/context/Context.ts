import process from 'node:process';

import type { Ability, Actor, Timestamp } from '@serenity-js/core';
import { Cast, Clock, Serenity, TakeNotes } from '@serenity-js/core';
import { TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events/index.js';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model/index.js';
import type { AbilityType, Discardable, Initialisable } from '@serenity-js/core/src/index.js';
import { CallAnApi } from '@serenity-js/rest';
import { BrowseTheWeb } from '@serenity-js/web';
import type { AxiosInstance } from 'axios';

import type { BrowserConnection } from '../../integration/BrowserConnection.js';
import { SerenityModuleManager } from '../../integration/SerenityModuleManager.js';
import { ScanRuntimeEnvironment } from '../../screenplay/abilities/ScanRuntimeEnvironment.js';

export class Context {
    // todo: load env variables upon initialization

    // todo: expose method to run a command and return:
    //   "success": true,
    //   "exitCode": 0,
    //   "stdout": "...",
    //   "stderr": "...",
    //   "error": null,
    //   "timestamp": "2025-09-13T12:34:56Z",
    //   "changedFiles": [
    //       {
    //           "path": "package.json",
    //           "diff": "...",         // (optional) unified diff or summary of changes
    //           "content": "..."       // (optional) new file content
    //       },
    // //

    private readonly abilities = new Map<AbilityType<Ability>, Ability>();

    constructor(
        private readonly browserConnection: BrowserConnection,
        private readonly axios: AxiosInstance,
        private readonly env: NodeJS.ProcessEnv = process.env,
        private readonly serenity: Serenity = new Serenity(new Clock(), process.cwd()),
    ) {
        this.serenity.configure({
            // ...
        });

        this.abilities.set(
            CallAnApi,
            CallAnApi.using(this.axios)
        );
        this.abilities.set(
            TakeNotes,
            TakeNotes.usingAnEmptyNotepad()
        );
        this.abilities.set(
            ScanRuntimeEnvironment,
            new ScanRuntimeEnvironment(process.cwd(), new SerenityModuleManager(this.axios))
        );

        this.serenity.announce(new TestRunStarts(this.now()));
    }

    // todo: launch a browser instance and provide an ability to use it
    //  when the browser is disconnected, restart the browser and reengage cast

    actor(name: string): Actor {
        return this.serenity.theActorCalled(name);
    }

    isInitialised(): boolean {
        return this.browserConnection.isConnected();
    }

    async initialise(): Promise<void> {
        await this.setAbility(BrowseTheWeb, await this.browserConnection.browseTheWeb());

        this.reengageActors();
    }

    async setAbility<A extends Ability>(abilityType: AbilityType<A>, ability: Ability): Promise<void> {

        if (this.abilities.has(abilityType)) {
            const originalAbility = this.abilities.get(abilityType);

            if (this.isDiscardable(originalAbility)) {
                await originalAbility.discard();
            }
        }

        if (this.isInitialisable(ability)) {
            await ability.initialise();
        }

        this.abilities.set(abilityType, ability);
    }

    private reengageActors(): void {
        this.serenity.engage(
            Cast.where(actor => actor.whoCan(
                ...this.abilities.values(),
            )),
        )
    }

    private now(): Timestamp {
        return this.serenity.currentTime();
    }

    async close(): Promise<void> {
        this.serenity.announce(new TestRunFinishes(this.now()))
        await this.serenity.waitForNextCue();
        await this.browserConnection.close();
        this.serenity.announce(new TestRunFinished(new ExecutionSuccessful(), this.now()));
    }

    private isDiscardable(ability: Ability): ability is Ability & Discardable {
        return ability['discard'] instanceof Function;
    }

    private isInitialisable(ability: Ability): ability is Ability & Initialisable {
        return ability['initialise'] instanceof Function
            && ability['isInitialised'] instanceof Function;
    }
}
