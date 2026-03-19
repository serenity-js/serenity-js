import { d } from '../../io/index.js';
import { stringified } from '../../io/stringified.js';
import { LogEntry, Name } from '../../model/index.js';
import type { UsesAbilities } from '../abilities/index.js';
import type { Answerable } from '../Answerable.js';
import type { CollectsArtifacts } from '../artifacts/index.js';
import { Interaction } from '../Interaction.js';
import type { AnswersQuestions } from '../questions/index.js';

/**
 * Instructs the [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * to [collect](https://serenity-js.org/api/core/interface/CollectsArtifacts/) arbitrary static values
 * and answers to [answerables](https://serenity-js.org/api/core/#Answerable),
 * so that they can be sent to the [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/)
 * and printed to the terminal by the [`ConsoleReporter`](https://serenity-js.org/api/console-reporter/class/ConsoleReporter/)
 * or attached to the HTML report by the [`SerenityBDDReporter`](https://serenity-js.org/api/serenity-bdd/class/SerenityBDDReporter/).
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
     * Instantiates a new [interaction](https://serenity-js.org/api/core/class/Interaction/) to [`Log`](https://serenity-js.org/api/core/class/Log/)
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
