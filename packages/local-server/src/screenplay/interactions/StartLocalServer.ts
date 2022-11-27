import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';

import { ManageALocalServer } from '../abilities';

/**
 * Starts local server so that a test can interact with it.
 *
 * @group Interactions
 */
export class StartLocalServer {

    /**
     * Starts local test server on a random available ports.
     */
    static onRandomPort(): Interaction {
        return new StartLocalServerOnRandomPort();
    }

    /**
     *  Instructs the {@apilink Actor} to start a local test server on one of the preferred ports.
     *
     *  Please note: this method is kept for backwards compatibility. However, its behaviour has changed
     *  and is currently identical to calling `StartLocalServer.onPort` with the first of `preferredPorts`
     *  passed as an argument.
     *
     * :::warning
     * This method is deprecated and will be removed in Serenity/JS 3.0.0.
     * Please use {@apilink StartLocalServer.onPort} and {@apilink StartLocalServer.onRandomPortBetween} instead.
     * :::
     *
     * @deprecated use {@link StartLocalServer.onPort} and {@link StartLocalServer.onRandomPortBetween} instead
     *
     * @param preferredPorts
     *  A list of preferred ports. Please note that only the first one will be used!
     */
    static onOneOfThePreferredPorts(preferredPorts: Answerable<number[]>): Interaction {
        return new StartLocalServerOnFirstOf(preferredPorts);
    }

    /**
     * Instructs the {@apilink Actor} to start a local test server on a `preferredPort`,
     * or a random one if that's not available.
     *
     * @param preferredPort
     */
    static onPort(preferredPort: Answerable<number>): Interaction {
        return new StartLocalServerOnPort(preferredPort);
    }

    /**
     * Instructs the {@apilink Actor} to start a local test server on a random port
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

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return ManageALocalServer.as(actor).listen();
    }
}

/**
 * @package
 */
class StartLocalServerOnPort extends Interaction {

    constructor(private readonly preferredPort: Answerable<number>) {
        super(`#actor starts local server on port ${ preferredPort }`);
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPort)
            .then(port => ManageALocalServer.as(actor).listen(port));
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

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return Promise.all([
            actor.answer(this.lowestPort),
            actor.answer(this.highestPort),
        ]).
        then(([lowestPort, highestPort]) => ManageALocalServer.as(actor).listen(lowestPort, highestPort));
    }
}

/**
 * @package
 */
class StartLocalServerOnFirstOf extends Interaction {

    constructor(private readonly preferredPorts: Answerable<number[]>) {
        super(`#actor starts local server on first port of ${ preferredPorts }`);
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPorts)
            .then(preferredPorts => ManageALocalServer.as(actor).listen(preferredPorts[0]));
    }
}
