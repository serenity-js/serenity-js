import type { Answerable, AnswersQuestions, CollectsArtifacts, UsesAbilities } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core';

import { ManageALocalServer } from '../abilities';

/**
 * Starts local server so that a test can interact with it.
 *
 * @group Activities
 */
export class StartLocalServer {

    /**
     * Starts local test server on a random available ports.
     */
    static onRandomPort(): Interaction {
        return new StartLocalServerOnRandomPort();
    }

    /**
     * Instructs the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to start a local test server on a `preferredPort`,
     * or a random one if that's not available.
     *
     * @param preferredPort
     */
    static onPort(preferredPort: Answerable<number>): Interaction {
        return new StartLocalServerOnPort(preferredPort);
    }

    /**
     * Instructs the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to start a local test server on a random port
     * between `lowestPort` and `highestPort`, inclusive.
     *
     * @param {Answerable<number>} lowestPort
     *  Lower bound of the preferred port range
     *
     * @param {Answerable<number>} highestPort
     *  Upper bound of the preferred port range
     */
    static onRandomPortBetween(lowestPort: Answerable<number>, highestPort: Answerable<number>): Interaction {
        return new StartLocalServerOnRandomPortBetween(lowestPort, highestPort);
    }
}

/**
 * @package
 */
class StartLocalServerOnRandomPort extends Interaction {

    constructor() {
        super(`#actor starts local server on a random port`);
    }

    async performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        await ManageALocalServer.as(actor).listen();
    }
}

/**
 * @package
 */
class StartLocalServerOnPort extends Interaction {

    constructor(private readonly preferredPort: Answerable<number>) {
        super(`#actor starts local server on port ${ preferredPort }`);
    }

    async performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        const preferredPort = await actor.answer(this.preferredPort);

        await ManageALocalServer.as(actor).listen(preferredPort);
    }
}

/**
 * @package
 */
class StartLocalServerOnRandomPortBetween extends Interaction {

    constructor(
        private readonly lowestPort: Answerable<number>,
        private readonly highestPort: Answerable<number>,
    ) {
        super(`#actor starts local server on port between ${ lowestPort } and ${ highestPort }`);
    }

    async performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        const lowestPort = await actor.answer(this.lowestPort);
        const highestPort = await actor.answer(this.highestPort);

        await ManageALocalServer.as(actor).listen(lowestPort, highestPort);
    }
}
