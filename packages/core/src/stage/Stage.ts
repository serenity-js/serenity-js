import { ensure, isDefined } from 'tiny-types';

import { ConfigurationError, LogicError } from '../errors';
import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent, SceneFinishes, SceneStarts, TestRunFinishes } from '../events';
import { CorrelationId, Description, Timestamp } from '../model';
import { ListensToDomainEvents } from '../screenplay';
import { Actor } from '../screenplay/actor';
import { Cast } from './Cast';
import { StageManager } from './StageManager';

export class Stage {

    /**
     * @desc
     *  Actors instantiated after the scene has started,
     *  who will be dismissed when the scene finishes.
     *
     * @private
     */
    private actorsOnFrontStage: Map<string, Actor> = new Map<string, Actor>();

    /**
     * @desc
     *  Actors instantiated before the scene has started,
     *  who will be dismissed when the test run finishes.
     *
     * @private
     */
    private actorsOnBackstage: Map<string, Actor> = new Map<string, Actor>();

    private actorsOnStage: Map<string, Actor> = this.actorsOnBackstage;

    /**
     * @desc
     *  The most recent actor referenced via the {@link actor} method
     *
     * @private
     */
    private actorInTheSpotlight: Actor = null;

    private currentActivity: CorrelationId = null;
    private currentScene: CorrelationId = new CorrelationId('unknown');

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
        if (! this.instantiatedActorCalled(name)) {
            let actor;
            try {
                const newActor = new Actor(name, this);

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

        this.actorInTheSpotlight = this.instantiatedActorCalled(name);

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
     * @desc
     *  Configures the Stage to prepare {@link Actor}s
     *  instantiated via {@link Stage#actor} using the provided {@link Cast}.
     *
     * @param {Cast} actors
     * @returns void
     */
    engage(actors: Cast): void {
        ensure('Cast', actors, isDefined());

        this.cast        = actors;
    }

    assign(...listeners: ListensToDomainEvents[]) {
        this.manager.register(...listeners);
    }

    announce(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            this.actorsOnStage = this.actorsOnFrontStage;
        }

        this.manager.notifyOf(event);

        if (event instanceof SceneFinishes) {
            this.dismiss(this.actorsOnStage);

            this.actorsOnStage = this.actorsOnBackstage;
        }

        if (event instanceof TestRunFinishes) {
            this.dismiss(this.actorsOnStage);
        }
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

    private instantiatedActorCalled(name: string): Actor | undefined {
        return this.actorsOnBackstage.has(name)
            ? this.actorsOnBackstage.get(name)
            : this.actorsOnFrontStage.get(name)
    }

    private dismiss(activeActors: Map<string, Actor>): Promise<void> {
        const actors = Array.from(activeActors.values());

        if (actors.find(actor => actor === this.actorInTheSpotlight)) {
            this.actorInTheSpotlight = null;
        }

        return Promise
            .all(actors.map(actor => {
                const id = CorrelationId.create();

                this.announce(new AsyncOperationAttempted(
                    new Description(`[${ this.constructor.name }] Dismissing ${ actor.name }...`),
                    id,
                ));

                return actor.dismiss()
                    .then(() =>
                        this.announce(new AsyncOperationCompleted(
                            new Description(`[${ this.constructor.name }] Dismissed ${ actor.name } successfully`),
                            id,
                        )))
                    .catch(error =>
                        this.announce(new AsyncOperationFailed(error, id)),
                    );

            }))
            .then(() => activeActors.clear());
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
