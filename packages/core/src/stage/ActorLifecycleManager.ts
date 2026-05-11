import { ensure, isDefined, property } from 'tiny-types';

import { ConfigurationError, LogicError, RaiseErrors } from '../errors/index.js';
import { ActorEntersStage, ActorSpotlighted, } from '../events/index.js';
import { CorrelationId } from '../model/index.js';
import type { Clock, Duration } from '../screenplay/index.js';
import { Actor, ScheduleWork } from '../screenplay/index.js';
import type { Cast } from './Cast.js';
import type { Stage } from './Stage.js';

/**
 * Represents the focus area where actors are tracked.
 *
 * - `'foreground'` - Scene-scoped actors that are dismissed when a scene finishes
 * - `'background'` - Test run-scoped actors that persist across scenes and are dismissed when the test run finishes
 *
 * @group Stage
 */
export type StageFocus = 'foreground' | 'background';

/**
 * Manages the lifecycle of [actors](https://serenity-js.org/api/core/class/Actor/) on the [stage](https://serenity-js.org/api/core/class/Stage/),
 * including their creation, retrieval, and tracking of which actors are in the foreground (scene-scoped)
 * versus background (test run-scoped).
 *
 * The `ActorLifecycleManager` is responsible for:
 * - Instantiating and caching actors via the configured [cast](https://serenity-js.org/api/core/class/Cast/)
 * - Tracking which actor is currently in the spotlight (active)
 * - Managing the focus area (foreground vs background) where new actors are created
 * - Providing access to actors for dismissal when scenes or test runs finish
 *
 * ## Default behaviour
 *
 * By default, actors created before the actual test scenario starts, e.g. in beforeAll hooks, are placed in the `'background'` focus area.
 * When a [`SceneStarts`](https://serenity-js.org/api/core-events/class/SceneStarts/) event is announced,
 * the focus switches to `'foreground'`. When a [`SceneFinishes`](https://serenity-js.org/api/core-events/class/SceneFinishes/)
 * event is announced, foreground actors are dismissed, their abilities [discarded](https://serenity-js.org/api/core/class/Discardable/)
 * and focus returns to `'background'`.
 *
 * ## Custom lifecycle management
 *
 * Test runner adapters like [`@serenity-js/playwright-test`](https://serenity-js.org/api/playwright-test/),
 * where test execution and reporting happen in separate processes, can inject a custom `ActorLifecycleManager` instance
 * to control actor lifecycle programmatically.
 *
 * ```typescript
 * const actorLifecycleManager = new ActorLifecycleManager(cast, clock, interactionTimeout);
 * const serenity = new Serenity(clock, cueTimeout, actorLifecycleManager);
 *
 * // At the start of each test:
 * actorLifecycleManager.switchFocus('foreground');
 * ```
 *
 * ## Learn more
 * - [`Stage`](https://serenity-js.org/api/core/class/Stage/)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 *
 * @group Stage
 */
export class ActorLifecycleManager {

    /**
     * The most recent actor referenced via the {@apilink actor} method
     */
    private currentActor?: Actor;

    /**
     * The scene in which the spotlight was last set.
     * Used to detect when the spotlight shifts to a different scene context.
     */
    private currentActorScene: CorrelationId = new CorrelationId('unknown');

    private currentFocusValue: StageFocus = 'background';

    private actors: Record<StageFocus, Map<string, Actor>> = {
        'foreground': new Map<string, Actor>(),
        'background': new Map<string, Actor>(),
    }

    protected stage: Stage;

    constructor(
        protected cast: Cast,
        protected readonly clock: Clock,
        protected interactionTimeout: Duration,
    ) {
    }

    /**
     * Configures the manager with new settings.
     *
     * @param options - Configuration options
     * @param options.interactionTimeout - The maximum time to wait for an interaction to complete
     */
    configure({ interactionTimeout }: { interactionTimeout: Duration }): void {
        this.interactionTimeout = interactionTimeout;
    }

    /**
     * Associates this manager with a [`Stage`](https://serenity-js.org/api/core/class/Stage/) instance.
     *
     * This method is called automatically by the `Stage` during construction.
     * It establishes the bidirectional relationship between the manager and the stage,
     * allowing the manager to emit [domain events](https://serenity-js.org/api/core-events/class/DomainEvent/)
     * when actors enter the stage or are spotlighted.
     *
     * @param stage - The Stage instance to associate with this manager
     */
    assignTo(stage: Stage): void {
        this.stage = stage;
    }

    /**
     * Configures the manager to use the provided [cast](https://serenity-js.org/api/core/class/Cast/) for preparing actors.
     *
     * @param actors - The cast to use for preparing new actors
     *
     * @throws [`ConfigurationError`](https://serenity-js.org/api/core/class/ConfigurationError/)
     *  If the provided cast is not defined or doesn't have a `prepare` method
     */
    engage(actors: Cast): void {
        this.cast = ensure('actors', actors, isDefined(), property('prepare', isDefined()));
    }

    /**
     * Returns the current [cast](https://serenity-js.org/api/core/class/Cast/) used for preparing actors.
     *
     * @returns The currently configured cast
     */
    currentCast(): Cast {
        return this.cast;
    }

    /**
     * Instantiates a new [`Actor`](https://serenity-js.org/api/core/class/Actor/) or fetches an existing one
     * identified by their name if they've already been instantiated.
     *
     * When a new actor is instantiated, an [`ActorEntersStage`](https://serenity-js.org/api/core-events/class/ActorEntersStage/)
     * event is announced. When the spotlight shifts to a different actor (or the same actor in a different scene),
     * an [`ActorSpotlighted`](https://serenity-js.org/api/core-events/class/ActorSpotlighted/) event is announced.
     *
     * Actors are first looked up in the `'background'` focus area, then in `'foreground'`.
     * New actors are always created in the current focus area.
     *
     * @param name - Case-sensitive name of the Actor, e.g. `Alice`
     * @returns The actor with the given name
     */
    public actor(name: string): Actor {
        if (! this.existingActorCalled(name)) {
            const actor = this.prepareActor(new Actor(name, this.stage, [
                new RaiseErrors(this.stage),
                new ScheduleWork(this.clock, this.interactionTimeout)
            ]));

            this.actors[this.currentFocusValue].set(actor.name, actor);

            this.stage.announce(
                new ActorEntersStage(
                    this.stage.currentSceneId(),
                    actor.toJSON(),
                    this.stage.currentTime(),
                )
            );
        }

        const previousActorInSpotlight = this.currentActor;
        const previousSceneOfSpotlightedActor = this.currentActorScene;

        this.currentActor = this.existingActorCalled(name);
        this.currentActorScene = this.stage.currentSceneId();

        const spotlightShifted = this.currentActor !== previousActorInSpotlight
            || ! this.stage.currentSceneId().equals(previousSceneOfSpotlightedActor);

        if (spotlightShifted) {
            this.stage.announce(
                new ActorSpotlighted(
                    this.stage.currentSceneId(),
                    this.currentActor.toJSON(),
                    this.stage.currentTime(),
                )
            );
        }

        return this.currentActor;
    }

    private prepareActor(actor: Actor): Actor {

        let preparedActor: Actor;

        try {
            preparedActor = this.cast.prepare(actor);
        }
        catch (error) {
            throw new ConfigurationError(`${ this.typeOf(this.cast) } encountered a problem when preparing actor "${ actor.name }" for stage`, error);
        }

        if (! (preparedActor instanceof Actor)) {
            throw new ConfigurationError(`Instead of a new instance of actor "${ actor.name }", ${ this.typeOf(this.cast) } returned ${ preparedActor }`);
        }

        return preparedActor;
    }

    private typeOf(cast: Cast): string {
        return cast.constructor === Object
            ? 'Cast'
            : cast.constructor.name;
    }

    private existingActorCalled(name: string): Actor {
        return this.actors['background'].has(name)
            ? this.actors['background'].get(name)
            : this.actors['foreground'].get(name);
    }

    /**
     * Returns `true` if there is an [`Actor`](https://serenity-js.org/api/core/class/Actor/) in the spotlight, `false` otherwise.
     *
     * @returns `true` if an actor is currently spotlighted
     */
    public hasActorInTheSpotlight(): boolean {
        return Boolean(this.currentActor);
    }

    /**
     * Returns the last [`Actor`](https://serenity-js.org/api/core/class/Actor/) instantiated
     * via [`actor`](https://serenity-js.org/api/core/class/ActorLifecycleManager/#actor).
     *
     * @returns The currently spotlighted actor
     *
     * @throws [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     *  If no [`Actor`](https://serenity-js.org/api/core/class/Actor/) has been activated yet
     */
    public actorInTheSpotlight(): Actor {
        if (! this.currentActor) {
            throw new LogicError(`There is no actor in the spotlight yet. Make sure you instantiate one with stage.actor(actorName) before calling this method.`);
        }

        return this.currentActor;
    }

    /**
     * Switches the focus to the specified stage area.
     *
     * Actors created after this call will be added to the specified area.
     * This method is typically called automatically by the [`Stage`](https://serenity-js.org/api/core/class/Stage/)
     * in response to [`SceneStarts`](https://serenity-js.org/api/core-events/class/SceneStarts/) and
     * [`SceneFinishes`](https://serenity-js.org/api/core-events/class/SceneFinishes/) events.
     *
     * Test runner adapters can also call this method directly to control actor lifecycle
     * when scene events are not available (e.g., in Playwright Test where the reporter
     * runs in a separate process).
     *
     * @param focus - The focus area to switch to: `'foreground'` for scene-scoped actors,
     *                `'background'` for test run-scoped actors
     */
    switchFocus(focus: StageFocus): void {
        this.currentFocusValue = focus;
    }

    /**
     * Returns the current focus area.
     *
     * @returns The current focus: `'foreground'` or `'background'`
     */
    currentFocus(): StageFocus {
        return this.currentFocusValue;
    }

    /**
     * Returns all actors in the specified focus area.
     *
     * This method is used by the [`Stage`](https://serenity-js.org/api/core/class/Stage/) to retrieve
     * actors for dismissal when scenes or test runs finish.
     *
     * @param focus - The focus area to retrieve actors from
     * @returns An array of actors in the specified focus area
     */
    actorsIn(focus: StageFocus): Actor[] {
        return Array.from(this.actors[focus].values());
    }

    /**
     * Clears the spotlight if the current actor is in the specified focus area.
     *
     * This ensures that after actors in a focus area are dismissed, the spotlight
     * doesn't reference a dismissed actor.
     *
     * @param focus - The focus area to check
     */
    clearSpotlightIfIn(focus: StageFocus): void {

        const actors = this.actorsIn(focus);

        if (actors.includes(this.currentActor)) {
            this.currentActor = undefined;
        }
    }

    /**
     * Clears all actors from the specified focus area.
     *
     * This method is called by the [`Stage`](https://serenity-js.org/api/core/class/Stage/) after
     * actors have been dismissed to remove them from the internal tracking maps.
     *
     * @param focus - The focus area to clear
     */
    clearActorsIn(focus: StageFocus): void {
        this.actors[focus].clear();
    }
}
