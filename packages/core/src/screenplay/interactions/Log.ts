import { inspected } from '../../io/inspected';
import { Name } from '../../model';
import { LogEntry } from '../../model/artifacts';
import { AnswersQuestions, CollectsArtifacts, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';

/**
 * @desc
 *  Enables the {@link Actor} to log arbitrary static values and answers to {@link Question}s,
 *  so that they can be printed to the terminal by the [`ConsoleReporter`](/modules/console-reporter/)
 *  and attached to the HTML report by the [`SerenityBDDReporter`](/modules/serenity-bdd/).
 *
 * @example
 *  import { Log } from '@serenity-js/core';
 *  import { Website } from '@serenity-js/protractor';
 *
 *  actor.attemptsTo(
 *      Log.the('Current page', Website.title(), Website.url()),
 *  );
 *
 * @extends {Interaction}
 */
export class Log extends Interaction {

    /**
     * @desc
     *  Instantiates a new {@link Log} {@link Interaction}.
     *
     * @param {...items: any[]} items
     *  The items to be logged
     * @returns {Interaction}
     */
    static the(...items: Array<Answerable<any>>) {
        return new Log(items);
    }

    /**
     * @param {...items: any[]} items
     *  The items to be logged
     */
    constructor(
        private readonly items: Array<Answerable<any>>,
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     */
    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        return Promise.all(
                this.items.map(item => actor.answer(item)),
            )
            .then(items =>
                items.forEach((item, i) =>
                    actor.collect(LogEntry.fromJSON({ data: inspected(item) }), new Name(inspected(this.items[i]))),
                ),
            );
    }

    /**
     * @desc
     *  Generates a description of this interaction
     *
     * @returns {string}
     *  Description of the {@link Interaction}
     */
    toString() {
        return `#actor logs: ${ this.items.join(', ') }`;
    }
}
