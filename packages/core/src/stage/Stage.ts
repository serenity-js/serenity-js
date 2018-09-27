import { ensure, isDefined } from 'tiny-types';
import { ConfigurationError, LogicError } from '../errors';
import { Actor } from '../screenplay/actor';
import { Cast } from './Cast';

export class Stage {
    private readonly actorsOnStage: { [name: string]: Actor } = {};
    private actorInTheSpotlight: Actor = null;

    constructor(
        private readonly actors: Cast,
    ) {
        ensure('Cast', actors, isDefined());
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
     * @desc Instantiates a new member of the {@link Cast} or fetches an existing one
     * by their name if they've already been instantiated.
     *
     * @param {string} name - case-sensitive name of the Actor
     * @return {Actor}
     */
    actor(name: string): Actor {
        if (! this.actorsOnStage[name]) {
            let actor;
            try {
                actor = this.actors.actor(name);
            }
            catch (error) {
                throw new ConfigurationError(`CustomActors encountered a problem when instantiating actor "${ name }"`, error);
            }

            if (! (actor instanceof Actor)) {
                throw new ConfigurationError(`Instead of a new instance of actor "${ name }", CustomActors returned ${ actor }`);
            }

            this.actorsOnStage[name] = actor;
        }

        this.actorInTheSpotlight = this.actorsOnStage[name];

        return this.actorInTheSpotlight;
    }

    /**
     * @desc Returns the last {@link Actor} instantiated via {@link Stage#actor}.
     * Useful when you don't can't or choose not to reference the actor by their name.
     *
     * @throws {@link LogicError} if no {@link Actor} has been activated yet
     * @return {Actor}
     */
    theActorInTheSpotlight(): Actor {
        if (! this.actorInTheSpotlight) {
            throw new LogicError(`There is no actor in the spotlight yet. Make sure you instantiate one with stage.actor(actorName) before calling this method.`);
        }

        return this.actorInTheSpotlight;
    }

    // todo: might be useful to ensure that the actors release any resources they're holding.
    // drawTheCurtain() {
        // dismiss all the actors
        // https://github.com/serenity-bdd/serenity-core/blob/master/serenity-screenplay/src/main/java/net/serenitybdd/screenplay/actors/Stage.java
    // }
}
