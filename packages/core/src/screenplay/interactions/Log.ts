import { AnswersQuestions } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';

/**
 * @experimental
 */
export class Log extends Interaction {
    static the(...items: Array<Answerable<any>>) {
        return new Log(items, console.info);    // tslint:disable-line:no-console
    }

    constructor(
        private readonly items: Array<Answerable<any>>,
        private readonly print: (...args: any[]) => void,
    ) {
        super();
    }

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return Promise.all(
                this.items.map(item => actor.answer(item)),
            )
            .then(items => this.print(...items));
    }

    toString() {
        return `#actor prints ${ this.items.join(', ') }`;
    }
}
