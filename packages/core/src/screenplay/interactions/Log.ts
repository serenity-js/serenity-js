import { d } from '../../io';
import { stringified } from '../../io/stringified';
import { LogEntry, Name } from '../../model';
import { UsesAbilities } from '../abilities';
import { Answerable } from '../Answerable';
import { CollectsArtifacts } from '../artifacts';
import { Interaction } from '../Interaction';
import { AnswersQuestions } from '../questions';

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
 * @group Activities
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
                LogEntry.fromJSON({ data: stringified(data) }),
                new Name(d`${ item }`)
            );
        }
    }
}
