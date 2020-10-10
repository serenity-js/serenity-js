import { ensure, isDefined } from 'tiny-types';
import { ConfigurationError, LogicError } from '../errors';
import { DomainEvent } from '../events';
import { ActivityDetails, CorrelationId, Timestamp } from '../model';
import { Activity, ListensToDomainEvents } from '../screenplay';
import { ActivityDescriber } from '../screenplay/activities/ActivityDescriber';
import { Actor } from '../screenplay/actor';
import { Cast } from './Cast';
import { StageManager } from './StageManager';

export class Stage {
    private static readonly describer = new ActivityDescriber();

    private actorsOnStage: Map<string, Actor> = new Map<string, Actor>();
    private actorInTheSpotlight: Actor = null;

    private currentActivity: CorrelationId = null;
    private currentScene: CorrelationId = new CorrelationId('unknown-scene');

    constructor(
        private cast: Cast,
        private readonly manager: StageManager,
    ) {
        ensure('Cast', cast, isDefined());
        ensure('StageManager', manager, isDefined());
    }

    /**
     * @desc An alias for {@link Stage#actor}
     * @see {Stage#actor}
     * @alias {Stage#actor}
     * @param {string} name
     * @return {Actor}
     */
    theActorCalled(name: string): Actor {
        return this.actor(name);
    }

    /**
     * @desc Instantiates a new {@link Actor} or fetches an existing one
     * by their name if they've already been instantiated.
     *
     * @param {string} name - case-sensitive name of the Actor
     * @return {Actor}
     */
    actor(name: string): Actor {
        if (! this.actorsOnStage.has(name)) {
            let actor;
            try {
                const newActor = new Actor(name, this);
                this.assign(newActor);

                actor = this.cast.prepare(newActor);
            }
            catch (error) {
                throw new ConfigurationError(`${ this.typeOf(this.cast) } encountered a problem when preparing actor "${ name }" for stage`, error);
            }

            if (! (actor instanceof Actor)) {
                throw new ConfigurationError(`Instead of a new instance of actor "${ name }", ${ this.typeOf(this.cast) } returned ${ actor }`);
            }

            this.actorsOnStage.set(name, actor)
        }

        this.actorInTheSpotlight = this.actorsOnStage.get(name);

        return this.actorInTheSpotlight;
    }

    /**
     * @desc
     *  Returns the last {@link Actor} instantiated via {@link Stage#actor}.
     *  Useful when you don't can't or choose not to reference the actor by their name.
     *
     * @throws {LogicError} if no {Actor} has been activated yet
     * @return {Actor}
     */
    theActorInTheSpotlight(): Actor {
        if (! this.actorInTheSpotlight) {
            throw new LogicError(`There is no actor in the spotlight yet. Make sure you instantiate one with stage.actor(actorName) before calling this method.`);
        }

        return this.actorInTheSpotlight;
    }

    /**
     * @desc
     *  Returns {true} if there is an {@link Actor} in the spotlight, {false} otherwise.
     *
     * @return {boolean}
     */
    theShowHasStarted(): boolean {
        return !! this.actorInTheSpotlight;
    }

    /**
     * @deprecated
     * @param {Cast} actors
     * @return {Stage}
     */
    callFor(actors: Cast): Stage {
        this.drawTheCurtain();
        this.engage(actors);

        return this;
    }

    drawTheCurtain() {
        Array.from(this.actorsOnStage.values())
            .forEach(actor => this.manager.deregister(actor));

        this.actorsOnStage.clear();
        this.actorInTheSpotlight = null;
    }

    engage(actors: Cast) {
        ensure('Cast', actors, isDefined());

        this.cast        = actors;
    }

    assign(...listeners: ListensToDomainEvents[]) {
        this.manager.register(...listeners);
    }

    announce(event: DomainEvent): void {
        this.manager.notifyOf(event);
    }

    currentTime(): Timestamp {
        return this.manager.currentTime();
    }

    assignNewSceneId() {
        // todo: inject an id factory to make it easier to test
        this.currentScene = CorrelationId.create();

        return this.currentScene;
    }

    currentSceneId() {
        return this.currentScene;
    }

    assignNewActivityId() {
        // todo: inject an id factory to make it easier to test
        this.currentActivity = CorrelationId.create();

        return this.currentActivity;
    }

    currentActivityId(): CorrelationId {
        if (! this.currentActivity) {
            throw new LogicError(`No activity is being performed. Did you call assignNewActivityId before invoking currentActivityId?`);
        }

        return this.currentActivity;
    }

    waitForNextCue(): Promise<void> {
        return this.manager.waitForNextCue();
    }

    /**
     * @private
     * @param {Cast} cast
     */
    private typeOf(cast: Cast): string {
        return this.cast.constructor !== Object
            ? this.cast.constructor.name
            : 'Cast';
    }
}
