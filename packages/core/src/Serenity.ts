import { ensure, isDefined, isInstanceOf, property } from 'tiny-types';

import { DomainEvent, SceneStarts } from './events';
import { ErrorStackParser } from './io';
import { Duration, Timestamp } from './model';
import { Actor } from './screenplay/actor';
import { SerenityConfig } from './SerenityConfig';
import { Clock, DressingRoom, Stage, StageCrewMember, StageManager } from './stage';
import { Extras } from './stage/Extras';

export class Serenity {
    private static defaultCueTimeout    = Duration.ofSeconds(5);
    private static defaultActors        = new Extras();

    private stage: Stage;

    constructor(private readonly clock: Clock = new Clock()) {
        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(Serenity.defaultCueTimeout, clock),
        );

        this.stage.assign(new StageHand());
    }

    /**
     * Configures Serenity/JS.
     *
     * This method should be called only once in your entire project
     * and before any tests are executed.
     *
     * @param {SerenityConfig} config
     * @return {void}
     */
    configure(config: SerenityConfig): void {

        const cueTimeout = !! config.cueTimeout
            ? ensure('cueTimeout', config.cueTimeout, isInstanceOf(Duration))
            : Serenity.defaultCueTimeout;

        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(cueTimeout, this.clock),
        );

        if (!! config.actors) {
            this.engage(config.actors);
        }

        this.stage.assign(new StageHand());

        if (Array.isArray(config.crew)) {
            this.stage.assign(...config.crew);
        }
    }

    /**
     * Re-configures Serenity/JS to use a new {@link DressingRoom}
     * to prepare the {@link Actor}s for the performance.
     *
     * Typically, you'd call this method in a "before each"
     * hook of your test runner of choice.
     *
     * @param {DressingRoom} actors
     * @return {void}
     */
    engage(actors: DressingRoom): void {
        this.stage.engage(
            ensure('actors', actors, property('prepare', isDefined())),
        );
    }

    theActorCalled(name: string): Actor {
        return this.stage.theActorCalled(name);
    }

    theActorInTheSpotlight(): Actor {
        return this.stage.theActorInTheSpotlight();
    }

    announce(event: DomainEvent): void {
        this.stage.announce(event);
    }

    currentTime(): Timestamp {
        return this.stage.currentTime();
    }

    /**
     * @internal
     */
    waitForNextCue(): Promise<void> {
        return this.stage.waitForNextCue();
    }

    /**
     * @deprecated
     * @experimental
     * @param stageCrewMembers
     */
    setTheStage(...stageCrewMembers: StageCrewMember[]): void {
        deprecated('serenity.setTheStage', 'Please use the new `configure({ crew: stageCrewMembers }) from @serenity-js/core instead.');

        this.stage.assign(...stageCrewMembers);
    }

    /**
     * @deprecated
     * @param actors
     */
    callToStageFor(actors: DressingRoom): Stage {
        deprecated('serenity.callToStageFor(...)', 'Please use `actorCalled(name)` and `actorInTheSpotlight()` functions from @serenity-js/core to access the actors instead.');

        return this.stage.callFor(actors);
    }
}

// todo: remove when the deprecated methods are removed
function deprecated(method: string, message: string) {
    const callers = new ErrorStackParser().parse(new Error())
        .filter(frame => ! /(node_modules)/.test(frame.fileName));

    console.warn(`[${ callers[2].fileName }:${ callers[2].lineNumber }]`, `${ method } has been deprecated. ${ message }`);   // tslint:disable-line:no-console
}

/**
 * @private
 */
class StageHand implements StageCrewMember {
    constructor(
        private readonly stage: Stage = null) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new StageHand(stage);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            this.stage.resetActors();
        }
    }
}
