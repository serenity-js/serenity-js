import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';

import { ManageALocalServer } from '../abilities';

/**
 * @desc
 *  Starts local server so that a test can interact with it.
 */
export class StartLocalServer {

    /**
     * @desc
     *  Starts local test server on a random available ports.
     *
     * @see {@link LocalServer.url}
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static onRandomPort(): Interaction {
        return new StartLocalServerOnRandomPort();
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to start a local test server on one of the preferred ports.
     *
     *  Please note: this method is kept for backwards compatibility. However, its behaviour has changed
     *  and is currently identical to calling `StartLocalServer.onPort` with the first of `preferredPorts`
     *  passed as an argument.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<number[]>} preferredPorts
     *  A list of preferred ports. Please note that only the first one will be used!
     *
     * @see {@link LocalServer.url}
     * @see {@link StartLocalServer.onPort}
     * @see {@link StartLocalServer.onRandomPortBetween}
     *
     * @deprecated Use `StartLocalServer.onPort` or `StartLocalServer.onRandomPortBetween`
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static onOneOfThePreferredPorts(preferredPorts: Answerable<number[]>): Interaction {
        return new StartLocalServerOnFirstOf(preferredPorts);
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to start a local test server on a `preferredPort`, or a random one if that's not available.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<number>} preferredPort
     *  preferred port
     *
     * @see {@link LocalServer.url}
     * @see {@link @serenity-js/core/lib/screenplay~Answerable}
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static onPort(preferredPort: Answerable<number>): Interaction {
        return new StartLocalServerOnPort(preferredPort);
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to start a local test server on a random port between `lowestPort` and `highestPort`.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<number>} lowestPort
     *  Lower bound of the preferred port range
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<number>} highestPort
     *  Upper bound of the preferred port range
     *
     * @see {@link LocalServer.url}
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static onRandomPortBetween(lowestPort: Answerable<number>, highestPort: Answerable<number>): Interaction {
        return new StartLocalServerOnRandomPortBetween(lowestPort, highestPort);
    }
}

/**
 * @package
 */
class StartLocalServerOnRandomPort extends Interaction {

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return ManageALocalServer.as(actor).listen();
    }

    toString(): string {
        return `#actor starts local server on a random port`;
    }
}

/**
 * @package
 */
class StartLocalServerOnPort extends Interaction {

    constructor(private readonly preferredPort: Answerable<number>) {
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPort)
            .then(port => ManageALocalServer.as(actor).listen(port));
    }

    toString(): string {
        return `#actor starts local server on port ${ this.preferredPort }`;
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
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return Promise.all([
            actor.answer(this.lowestPort),
            actor.answer(this.highestPort),
        ]).
        then(([lowestPort, highestPort]) => ManageALocalServer.as(actor).listen(lowestPort, highestPort));
    }

    toString(): string {
        return `#actor starts local server on port between ${ this.lowestPort } and ${ this.highestPort }`;
    }
}

/**
 * @package
 */
class StartLocalServerOnFirstOf extends Interaction {

    constructor(private readonly preferredPorts: Answerable<number[]>) {
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPorts)
            .then(preferredPorts => ManageALocalServer.as(actor).listen(preferredPorts[0]));
    }

    toString(): string {
        return `#actor starts local server on first port of ${ this.preferredPorts }`;
    }
}
