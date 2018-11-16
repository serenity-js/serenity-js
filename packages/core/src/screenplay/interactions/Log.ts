import { AnswersQuestions } from '../actor';
import { Interaction } from '../Interaction';
import { KnowableUnknown } from '../KnowableUnknown';

export class Log implements Interaction {
    static info(...items: Array<KnowableUnknown<any>>) {
        return new Log(items, console.info);    // tslint:disable-line:no-console
    }

    constructor(
        private readonly items: Array<KnowableUnknown<any>>,
        private readonly print: (...args: any[]) => void,
    ) {
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
