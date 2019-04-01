import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { Name, TextData } from '@serenity-js/core/lib/model';

/**
 * @public
 * @abstract
 */
export abstract class ExecuteScriptWithArguments extends Interaction {

    constructor(
        protected readonly script: string | Function,                                   // tslint:disable-line:ban-types
        protected readonly args: Array<Answerable<any>> = [],
    ) {
        super();
    }

    public abstract withArguments(...args: Array<Answerable<any>>): Interaction;

    protected abstract executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any>;

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): PromiseLike<void> {
        return this.answerAll(this.args).as(actor)
            .then(args => this.executeAs(actor, args))
            .then(() => actor.collect(
                TextData.fromJSON({
                    contentType:    'text/javascript;charset=UTF-8',
                    data:           this.script.toString(),
                }),
                new Name('Script source'),
            ));
    }

    /**
     * @private
     *
     * @param {Array<Answerable<any>>} args
     */
    private answerAll(args: Array<Answerable<any>>) {
        return {
            as: (actor: AnswersQuestions & UsesAbilities): Promise<any[]> => Promise.all(args.map(arg => {
                const maybeElementFinder = Question.isAQuestion(arg)
                    ? arg.answeredBy(actor)
                    : arg;

                const maybePromise = !! maybeElementFinder.getWebElement
                    ? maybeElementFinder.getWebElement()
                    : maybeElementFinder;

                return actor.answer(maybePromise);
            })),
        };
    }
}
