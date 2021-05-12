import { ensure, isDefined, isInstanceOf, property } from 'tiny-types';

import { ConfigurationError } from './errors';
import { DomainEvent } from './events';
import { formatted, has, OutputStream } from './io';
import { CorrelationId, Duration, Timestamp } from './model';
import { Actor } from './screenplay/actor/Actor';
import { SerenityConfig } from './SerenityConfig';
import { StageCrewMember, StageCrewMemberBuilder } from './stage';
import { Cast } from './stage/Cast';
import { Clock } from './stage/Clock';
import { Extras } from './stage/Extras';
import { Stage } from './stage/Stage';
import { StageManager } from './stage/StageManager';

export class Serenity {
    private static defaultCueTimeout    = Duration.ofSeconds(5);
    private static defaultActors        = new Extras();

    private stage: Stage;
    private outputStream: OutputStream  = process.stdout;

    /**
     * @param {Clock} clock
     */
    constructor(private readonly clock: Clock = new Clock()) {
        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(Serenity.defaultCueTimeout, clock),
        );
    }

    /**
     * @desc
     *  Configures Serenity/JS. Every call to this function
     *  replaces the previous configuration provided,
     *  so this function should called be exactly once
     *  in your test suite.
     *
     * @param {SerenityConfig} config
     * @return {void}
     */
    configure(config: SerenityConfig): void {
        const looksLikeBuilder          = has<StageCrewMemberBuilder>({ build: 'function' });
        const looksLikeStageCrewMember  = has<StageCrewMember>({ assignedTo: 'function', notifyOf: 'function' });

        const cueTimeout = config.cueTimeout
            ? ensure('cueTimeout', config.cueTimeout, isInstanceOf(Duration))
            : Serenity.defaultCueTimeout;

        if (config.outputStream) {
            this.outputStream = config.outputStream;
        }

        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(cueTimeout, this.clock),
        );

        if (config.actors) {
            this.engage(config.actors);
        }

        if (Array.isArray(config.crew)) {
            this.stage.assign(
                ...config.crew.map((stageCrewMember, i) => {
                    if (looksLikeBuilder(stageCrewMember)) {
                        return stageCrewMember.build({ stage: this.stage, outputStream: this.outputStream });
                    }

                    if (looksLikeStageCrewMember(stageCrewMember)) {
                        return stageCrewMember.assignedTo(this.stage);
                    }

                    throw new ConfigurationError(
                        formatted `Entries under \`crew\` should implement either StageCrewMember or StageCrewMemberBuilder interfaces, \`${ stageCrewMember }\` found at index ${ i }`
                    );
                }),
            );
        }
    }

    /**
     * @desc
     *  Re-configures Serenity/JS with a new {@link Cast} of {@link Actor}s
     *  you'd like to use in any subsequent call to {@link actorCalled}.
     *
     *  This method provides an alternative to calling {@link Actor#whoCan}
     *  directly in your tests and you'd typically us it in a "before each"
     *  hook of your test runner of choice.
     *
     * @example <caption>Engaging a cast of actors</caption>
     *  import { Actor, Cast } from '@serenity-js/core';
     *
     *  class Actors implements Cast {
     *      prepare(actor: Actor) {
     *          return actor.whoCan(
     *              // ... abilities you'd like the Actor to have
     *          );
     *      }
     *  }
     *
     * engage(new Actors();
     *
     * @example <caption>Usage with Jasmine</caption>
     *  import 'jasmine';
     *
     *  beforeEach(() => engage(new Actors()));
     *
     * @example <caption>Usage with Cucumber</caption>
     *  import { Before } from 'cucumber';
     *
     *  Before(() => engage(new Actors());
     *
     * @param {Cast} actors
     * @returns {void}
     *
     * @see {@link Actor}
     * @see {@link Cast}
     */
    engage(actors: Cast): void {
        this.stage.engage(
            ensure('actors', actors, property('prepare', isDefined())),
        );
    }

    /**
     * @desc
     *  Instantiates or retrieves an actor {@link Actor}
     *  called `name` if one has already been instantiated.
     *
     * @example <caption>Usage with Jasmine</caption>
     *   import 'jasmine';
     *   import { actorCalled } from '@serenity-js/core';
     *
     *   describe('Feature', () => {
     *
     *      it('should have some behaviour', () =>
     *          actorCalled('James').attemptsTo(
     *              // ... activities
     *          ));
     *   });
     *
     * @example <caption>Usage with Cucumber</caption>
     *   import { actorCalled } from '@serenity-js/core';
     *   import { Given } from 'cucumber';
     *
     *   Given(/(.*?) is a registered user/, (name: string) =>
     *      actorCalled(name).attemptsTo(
     *              // ... activities
     *          ));
     *
     * @param {string} name
     *  The name of the actor to instantiate or retrieve
     *
     * @returns {Actor}
     *
     * @see {@link engage}
     * @see {@link Actor}
     * @see {@link Cast}
     */
    theActorCalled(name: string): Actor {
        return this.stage.theActorCalled(name);
    }

    /**
     * @desc
     *  Retrieves an actor who was last instantiated or retrieved
     *  using {@link actorCalled}.
     *
     *  This function is particularly useful when automating Cucumber scenarios.
     *
     * @example <caption>Usage with Cucumber</caption>
     *   import { actorCalled } from '@serenity-js/core';
     *   import { Given, When } from 'cucumber';
     *
     *   Given(/(.*?) is a registered user/, (name: string) =>
     *      actorCalled(name).attemptsTo(
     *              // ... activities
     *          ));
     *
     *   When(/(?:he|she|they) browse their recent orders/, () =>
     *      actorInTheSpotlight().attemptsTo(
     *              // ... activities
     *          ));
     *
     * @returns {Actor}
     *
     * @see {@link engage}
     * @see {@link actorCalled}
     * @see {@link Actor}
     * @see {@link Cast}
     */
    theActorInTheSpotlight(): Actor {
        return this.stage.theActorInTheSpotlight();
    }

    announce(event: DomainEvent): void {
        this.stage.announce(event);
    }

    currentTime(): Timestamp {
        return this.stage.currentTime();
    }

    assignNewSceneId(): CorrelationId {
        return this.stage.assignNewSceneId();
    }

    currentSceneId(): CorrelationId {
        return this.stage.currentSceneId();
    }

    assignNewActivityId(): CorrelationId {
        return this.stage.assignNewActivityId();
    }

    /**
     * @package
     */
    waitForNextCue(): Promise<void> {
        return this.stage.waitForNextCue();
    }
}
