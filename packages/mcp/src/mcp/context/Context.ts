import type { Actor, Timestamp } from '@serenity-js/core';
import { Cast, Clock, Serenity, TakeNotes } from '@serenity-js/core';
import { TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events/index.js';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model/index.js';
import { CallAnApi, createAxios } from '@serenity-js/rest';

import type { BrowserConnection } from './BrowserConnection.js';

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

    constructor(
        private readonly browserConnection: BrowserConnection,
        private readonly env: NodeJS.ProcessEnv = process.env,
        private readonly serenity: Serenity = new Serenity(new Clock(), process.cwd()),
    ) {
        this.serenity.configure({
            // ...
        });

        this.serenity.announce(new TestRunStarts(this.now()))
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
        const browseTheWeb = await this.browserConnection.browseTheWeb();

        this.serenity.engage(
            Cast.where(actor => actor.whoCan(
                TakeNotes.usingAnEmptyNotepad(),
                CallAnApi.using(createAxios()),
                browseTheWeb,
                // todo: add ability to execute CLI commands
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
}
