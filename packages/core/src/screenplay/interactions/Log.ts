import { inspected } from '../../io/inspected';
import { Name } from '../../model';
import { LogEntry } from '../../model/artifacts';
import { AnswersQuestions, CollectsArtifacts, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';

export class Log extends Interaction {
    static the(...items: Array<Answerable<any>>) {
        return new Log(items);
    }

    constructor(
        private readonly items: Array<Answerable<any>>,
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): PromiseLike<void> {
        return Promise.all(
                this.items.map(item => actor.answer(item)),
            )
            .then(items =>
                items.forEach((item, i) =>
                    actor.collect(LogEntry.fromJSON({ data: inspected(item) }), new Name(inspected(this.items[i]))),
                ),
            );
    }

    toString() {
        return `#actor logs: ${ this.items.join(', ') }`;
    }
}
