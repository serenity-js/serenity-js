import { d } from '../../io';
import { inspected } from '../../io/inspected';
import { LogEntry, Name } from '../../model';
import { AnswersQuestions, CollectsArtifacts, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';

/**
 * Instructs the {@apilink Actor} to {@apilink CollectsArtifacts|collect} arbitrary static values and answers to {@apilink Answerable|Answerables},
 * so that they can be sent to the {@apilink StageCrewMember|StageCrewMembers}
 * and printed to the terminal by the {@apilink ConsoleReporter}
 * or attached to the HTML report by the {@apilink SerenityBDDReporter}.
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
     * Instantiates a new {@apilink Interaction|interaction} to {@apilink Log}
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
    protected constructor(
        private readonly items: Array<Answerable<any>>,
    ) {
        super(`#actor logs: ${ items.map(item => d`${ item }`).join(', ') }`);
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
}
