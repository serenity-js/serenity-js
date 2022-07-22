import { d } from '../../io';
import { inspected } from '../../io/inspected';
import { LogEntry, Name } from '../../model';
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
    static the(...items: Array<Answerable<any>>): Interaction {
        return new Log(items);
    }

    /**
     * @param {Array<Answerable<any>>} items
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
     * @param {UsesAbilities & AnswersQuestions & CollectsArtifacts} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     * @see {@link CollectsArtifacts}
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
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor logs: ${ this.items.map(item => d`${ item }`).join(', ') }`;
    }
}
