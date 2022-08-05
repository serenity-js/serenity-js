import { d } from '../../io';
import { inspected } from '../../io/inspected';
import { LogEntry, Name } from '../../model';
import { AnswersQuestions, CollectsArtifacts, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';

/**
 * Instructs the {@link Actor} to {@link CollectsArtifacts|collect} arbitrary static values and answers to {@link Answerable|Answerables},
 * so that they can be sent to the {@link StageCrewMember|StageCrewMembers}
 * and printed to the terminal by the {@link ConsoleReporter}
 * or attached to the HTML report by the {@link SerenityBDDReporter}.
 *
 * ## Logging static and `Answerable` values
 *
 * ```ts
 * import { actorCalled, Log } from '@serenity-js/core'
 * import { Page } from '@serenity-js/web'
 *
 * await actorCalled('Laura').attemptsTo(
 *   Log.the('Current page', Page.current().title(), Page.current().url()),
 * )
 * ```
 *
 * @group Interactions
 */
export class Log extends Interaction {

    /**
     * Instantiates a new {@link Interaction|interaction} to {@link Log}
     *
     * Note that this method accepts [variable number of arguments](https://www.typescriptlang.org/docs/handbook/functions.html#rest-parameters),
     * so that you can easily log several values at the same time.
     *
     * @param items
     *  The items to be logged
     */
    static the(...items: Array<Answerable<any>>): Interaction {
        return new Log(items);
    }

    /**
     * @param items
     *  The items to be logged
     */
    constructor(
        private readonly items: Array<Answerable<any>>,
    ) {
        super();
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        for (const item of this.items) {

            const data = await actor.answer(item);

            actor.collect(
                LogEntry.fromJSON({ data: inspected(data) }),
                new Name(d`${ item }`)
            );
        }
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return `#actor logs: ${ this.items.map(item => d`${ item }`).join(', ') }`;
    }
}
