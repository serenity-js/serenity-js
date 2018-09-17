import { AnswersQuestions, Interaction, Question } from '..';

export type PromisedAssertion<A> = (actual: A) => PromiseLike<any>;
export type Assertion<A>         = (actual: A) => void;

export class See<S> implements Interaction {
    static if<T>(question: Question<T>, assertion: Assertion<T> | PromisedAssertion<T>) {
        return new See<T>(question, assertion);
    }

    constructor(
        private question: Question<S>,
        private assert: Assertion<S> | PromisedAssertion<S>,
    ) {
    }

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return new Promise((resolve, reject) => {
            try {
                const result = this.assert(actor.toSee(this.question));

                if (this.isAPromiseOf(result)) {
                    return result.then(resolve, reject);
                }

                resolve(void 0);
            }
            catch (error) {
                reject(error);  // todo: an opportunity for a custom assertion error with diffs
            }
        });
    }

    toString = () => `#actor checks ${this.question}`;

    private isAPromiseOf(value: any): value is PromiseLike<any> {
        return !! value && !! value.then;
    }
}
