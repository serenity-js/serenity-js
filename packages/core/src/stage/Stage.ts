import { ensure, isDefined } from 'tiny-types';

import type { SerenityConfig } from '../config/index.js';
import {
    ErrorFactory,
    type ErrorOptions,
    LogicError,
    type RuntimeError
} from '../errors/index.js';
import {
    ActorStageExitAttempted,
    ActorStageExitCompleted,
    ActorStageExitFailed,
    ActorStageExitStarts,
    type DomainEvent,
    type EmitsDomainEvents,
    SceneFinishes,
    SceneStarts,
    TestRunFinishes
} from '../events/index.js';
import { type ActivityDetails, CorrelationId, type CorrelationIdFactory, Name } from '../model/index.js';
import type { Actor} from '../screenplay/index.js';
import type { Clock, Duration, Timestamp } from '../screenplay/index.js';
import { ActorLifecycleManager, type StageFocus } from './ActorLifecycleManager.js';
import type { Cast } from './Cast.js';
import type { ListensToDomainEvents } from './ListensToDomainEvents.js';
import type { StageManager } from './StageManager.js';

/**
 * Stage is the place where [actors](https://serenity-js.org/api/core/class/Actor/) perform.
 *
 * In more technical terms, the Stage is the main event bus propagating [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/)
 * to [actors](https://serenity-js.org/api/core/class/Actor/) it instantiates and [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/) that have been registered with it.
 *
 * It is unlikely that you'll ever need to interact with the `Stage` directly in your tests. Instead, you'll use functions like
 * [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/) and [`actorInTheSpotlight`](https://serenity-js.org/api/core/function/actorInTheSpotlight/).
 *
 * ## Learn more
 * - [`configure`](https://serenity-js.org/api/core/function/configure/)
 * - [`engage`](https://serenity-js.org/api/core/function/engage/)
 * - [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/)
 *
 * @group Stage
 */
export class Stage implements EmitsDomainEvents {

    public static readonly unknownSceneId = new CorrelationId('unknown')

    private currentActivity: { id: CorrelationId, details: ActivityDetails } = undefined;

    private currentScene: CorrelationId = Stage.unknownSceneId;

    private readonly actorLifecycleManager: ActorLifecycleManager

    /**
     * Creates a new Stage instance.
     *
     * @param cast - The default cast to use for preparing actors
     * @param manager - The stage manager responsible for notifying listeners of domain events
     * @param errors - Factory for creating runtime errors with proper context
     * @param clock - Clock used for timestamping domain events
     * @param interactionTimeout - Default timeout for actor interactions
     * @param sceneIdFactory - Factory for creating scene correlation IDs
     * @param actorLifecycleManager - Optional custom ActorLifecycleManager instance.
     *        When provided, allows test runner adapters to control actor lifecycle programmatically.
     *        If not provided, a default manager is created.
     */
    constructor(
        cast: Cast,
        private readonly manager: StageManager,
        private errors: ErrorFactory,
        private readonly clock: Clock,
        interactionTimeout: Duration,
        private readonly sceneIdFactory: CorrelationIdFactory = CorrelationId,
        actorLifecycleManager?: ActorLifecycleManager,
    ) {
        ensure('Cast', cast, isDefined());
        ensure('StageManager', manager, isDefined());
        ensure('ErrorFactory', errors, isDefined());
        ensure('Clock', clock, isDefined());
        ensure('interactionTimeout', interactionTimeout, isDefined());
        ensure('sceneIdFactory', sceneIdFactory, isDefined());

        this.actorLifecycleManager = actorLifecycleManager ?? new ActorLifecycleManager(cast, this.clock, interactionTimeout);
        this.actorLifecycleManager.assignTo(this);
    }

    configure(options: Pick<SerenityConfig, 'actors' | 'cueTimeout' | 'interactionTimeout' | 'diffFormatter'>): void {
        if (options.interactionTimeout) {
            this.actorLifecycleManager.configure({ interactionTimeout: options.interactionTimeout });
        }

        if (options.actors) {
            this.actorLifecycleManager.engage(options.actors);
        }

        if (options.cueTimeout) {
            this.manager.configure({ cueTimeout: options.cueTimeout })
        }

        if (options.diffFormatter) {
            this.errors = new ErrorFactory(options.diffFormatter);
        }
    }

    /**
     * An alias for [`Stage.actor`](https://serenity-js.org/api/core/class/Stage/#actor)
     *
     * @param name
     */
    theActorCalled(name: string): Actor {
        return this.actor(name);
    }

    /**
     * Instantiates a new [`Actor`](https://serenity-js.org/api/core/class/Actor/) or fetches an existing one
     * identified by their name if they've already been instantiated.
     *
     * @param name
     *  Case-sensitive name of the Actor, e.g. `Alice`
     */
    actor(name: string): Actor {
        return this.actorLifecycleManager.actor(name);
    }

    /**
     * Returns the last [`Actor`](https://serenity-js.org/api/core/class/Actor/) instantiated via [`Stage.actor`](https://serenity-js.org/api/core/class/Stage/#actor).
     * Useful when you don't can't or choose not to reference the actor by their name.
     *
     * @throws [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     *  If no [`Actor`](https://serenity-js.org/api/core/class/Actor/) has been activated yet
     */
    theActorInTheSpotlight(): Actor {
        return this.actorLifecycleManager.actorInTheSpotlight();
    }

    /**
     * Returns `true` if there is an [`Actor`](https://serenity-js.org/api/core/class/Actor/) in the spotlight, `false` otherwise.
     */
    theShowHasStarted(): boolean {
        return this.actorLifecycleManager.hasActorInTheSpotlight();
    }

    /**
     * Configures the Stage to prepare [actors](https://serenity-js.org/api/core/class/Actor/)
     * instantiated via [`Stage.actor`](https://serenity-js.org/api/core/class/Stage/#actor) using the provided [cast](https://serenity-js.org/api/core/class/Cast/).
     *
     * @param actors
     */
    engage(actors: Cast): void {
        this.actorLifecycleManager.engage(actors);
    }

    /**
     * Assigns listeners to be notified of [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/)
     * emitted via [`Stage.announce`](https://serenity-js.org/api/core/class/Stage/#announce).
     *
     * @param listeners
     */
    assign(...listeners: ListensToDomainEvents[]): void {
        this.manager.register(...listeners);
    }

    /**
     * Notifies all the assigned listeners of the events,
     * emitting them one by one.
     *
     * @param events
     */
    announce(...events: Array<DomainEvent>): void {
        events.forEach(event => {
            this.announceSingle(event)
        });
    }

    private announceSingle(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            this.actorLifecycleManager.switchFocus('foreground');
        }

        if (event instanceof SceneFinishes || event instanceof TestRunFinishes) {
            this.notifyOfStageExit(this.actorLifecycleManager.currentFocus());
        }

        this.manager.notifyOf(event);

        if (event instanceof SceneFinishes) {
            this.dismissActorsIn('foreground');
            this.actorLifecycleManager.switchFocus('background');
        }

        if (event instanceof TestRunFinishes) {
            this.dismissActorsIn('background');
        }
    }

    private notifyOfStageExit(focus: StageFocus): void {
        for (const actor of this.actorLifecycleManager.actorsIn(focus)) {
            this.announce(new ActorStageExitStarts(
                this.currentSceneId(),
                actor.toJSON(),
                this.currentTime(),
            ));
        }
    }

    private async dismissActorsIn(focus: StageFocus): Promise<void> {
        const actors = this.actorLifecycleManager.actorsIn(focus);

        this.actorLifecycleManager.clearSpotlightIfIn(focus);

        // Wait for the Photographer to finish taking any screenshots
        await this.manager.waitForAsyncOperationsToComplete();

        const actorsToDismiss = new Map<Actor, CorrelationId>(actors.map(actor => [ actor, CorrelationId.create() ]));

        for (const [ actor, correlationId ] of actorsToDismiss) {
            this.announce(new ActorStageExitAttempted(
                correlationId,
                new Name(actor.name),
                this.currentTime(),
            ));
        }

        // Try to dismiss each actor
        for (const [ actor, correlationId ] of actorsToDismiss) {
            try {
                await actor.dismiss();

                this.announce(new ActorStageExitCompleted(correlationId, new Name(actor.name), this.currentTime()));
            }
            catch (error) {
                this.announce(new ActorStageExitFailed(
                    error,
                    correlationId,
                    this.currentTime()
                ));
            }
        }

        this.actorLifecycleManager.clearActorsIn(focus);
    }

    /**
     * Returns current time. This method should be used whenever
     * [`DomainEvent`](https://serenity-js.org/api/core-events/class/DomainEvent/) objects are instantiated by you programmatically.
     */
    currentTime(): Timestamp {
        return this.clock.now();
    }

    /**
     * Generates and remembers a `CorrelationId`
     * for the current scene.
     *
     * This method should be used in custom test runner adapters
     * when instantiating a [SceneStarts](https://serenity-js.org/api/core-events/class/SceneStarts/) event.
     *
     * #### Learn more
     * - [`Stage.currentSceneId`](https://serenity-js.org/api/core/class/Stage/#currentSceneId)
     */
    assignNewSceneId(): CorrelationId {
        this.currentScene = this.sceneIdFactory.create();

        return this.currentScene;
    }

    /**
     * Returns the `CorrelationId` for the current scene.
     *
     * #### Learn more
     * - [`Stage.assignNewSceneId`](https://serenity-js.org/api/core/class/Stage/#assignNewSceneId)
     */
    currentSceneId(): CorrelationId {
        return this.currentScene;
    }

    /**
     * Generates and remembers a `CorrelationId`
     * for the current [`Activity`](https://serenity-js.org/api/core/class/Activity/).
     *
     * This method should be used in custom test runner adapters
     * when instantiating the [ActivityStarts](https://serenity-js.org/api/core-events/class/ActivityStarts/) event.
     *
     * #### Learn more
     * - [`Stage.currentActivityId`](https://serenity-js.org/api/core/class/Stage/#currentActivityId)
     */
    assignNewActivityId(activityDetails: ActivityDetails): CorrelationId {
        this.currentActivity = {
            id: CorrelationId.create(),
            details: activityDetails,
        };

        return this.currentActivity.id;
    }

    /**
     * Returns the `CorrelationId` for the current [`Activity`](https://serenity-js.org/api/core/class/Activity/).
     *
     * #### Learn more
     * - [`Stage.assignNewSceneId`](https://serenity-js.org/api/core/class/Stage/#assignNewSceneId)
     */
    currentActivityId(): CorrelationId {
        if (! this.currentActivity) {
            throw new LogicError(`No activity is being performed. Did you call assignNewActivityId before invoking currentActivityId?`);
        }

        return this.currentActivity.id;
    }

    /**
     * Returns a Promise that will be resolved when any asynchronous
     * post-processing activities performed by Serenity/JS are completed.
     *
     * Invoked in Serenity/JS test runner adapters to inform the test runner when
     * the scenario has finished and when it's safe for the test runner to proceed
     * with the next test, or finish execution.
     */
    waitForNextCue(): Promise<void> {
        return this.manager.waitForNextCue();
    }

    createError<RE extends RuntimeError>(errorType: new (...args: any[]) => RE, options: ErrorOptions): RE {
        return this.errors.create(errorType, {
            location: this.currentActivity?.details.location,
            ...options,
        });
    }
}
