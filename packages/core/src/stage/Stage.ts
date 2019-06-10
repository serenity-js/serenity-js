import { ensure, isDefined } from 'tiny-types';
import { ConfigurationError, LogicError } from '../errors';
import { DomainEvent } from '../events';
import { Timestamp } from '../model';
import { Actor } from '../screenplay/actor';
import { DressingRoom } from './DressingRoom';
import { StageCrewMember } from './StageCrewMember';
import { StageManager } from './StageManager';

export class Stage {
    private actorsOnStage: { [name: string]: Actor } = {};
    private actorInTheSpotlight: Actor = null;

    constructor(
        private dressingRoom: DressingRoom,
        private readonly manager: StageManager,
    ) {
        ensure('DressingRoom', dressingRoom, isDefined());
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
        if (! this.actorsOnStage[name]) {
            let actor;
            try {
                actor = this.dressingRoom.prepare(new Actor(name, this));
            }
            catch (error) {
                throw new ConfigurationError(`${ this.typeOf(this.dressingRoom) } encountered a problem when preparing actor "${ name }" for stage`, error);
            }

            if (! (actor instanceof Actor)) {
                throw new ConfigurationError(`Instead of a new instance of actor "${ name }", ${ this.typeOf(this.dressingRoom) } returned ${ actor }`);
            }

            this.actorsOnStage[name] = actor;
        }

        this.actorInTheSpotlight = this.actorsOnStage[name];

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

    callFor(actors: DressingRoom): Stage {
        ensure('DressingRoom', actors, isDefined());

        this.dressingRoom = actors;
        this.actorsOnStage = {};
        this.actorInTheSpotlight = null;

        return this;
    }

    assign(...stageCrewMembers: StageCrewMember[]) {
        stageCrewMembers.forEach(stageCrewMember => {
            this.manager.register(stageCrewMember.assignedTo(this));
        });
    }

    announce(event: DomainEvent): void {
        this.manager.notifyOf(event);
    }

    currentTime(): Timestamp {
        return this.manager.currentTime();
    }

    waitForNextCue(): Promise<void> {
        return this.manager.waitForNextCue();
    }

    /**
     * @private
     * @param {DressingRoom} dressingRoom
     */
    private typeOf(dressingRoom: DressingRoom): string {
        return this.dressingRoom.constructor !== Object
            ? this.dressingRoom.constructor.name
            : 'DressingRoom';
    }

    // todo: might be useful to ensure that the actors release any resources they're holding.
    // drawTheCurtain() {
        // dismiss all the actors
        // https://github.com/serenity-bdd/serenity-core/blob/master/serenity-screenplay/src/main/java/net/serenitybdd/screenplay/actors/Stage.java
    // }
}
