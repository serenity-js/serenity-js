import { Answerable, AnswersQuestions, Interaction } from '../../../src/screenplay';

export class Spy extends Interaction {
    private static callArgs: any[][] = [];

    static on(...answerables: Array<Answerable<any>>): Spy {
        return new Spy(answerables);
    }

    static call(n: number): any[] {
        return Spy.callArgs[n];
    }

    static calls(): number {
        return Spy.callArgs.length;
    }

    static reset(): void {
        Spy.callArgs = [];
    }

    constructor(private readonly answerables: Array<Answerable<any>>) {
        super();
    }

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return Promise.all(
            this.answerables.map(answerable => actor.answer(answerable))
        ).then(answers => {
            Spy.callArgs.push(answers);
        });
    }

    toString(): string {
        return `#actor spies...`;
    }
}

