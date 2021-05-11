import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * @experimental
 */
export class Transform<Answer_Type extends any, Output_Type> extends Question<Promise<Output_Type>> {
    static the<AT extends any, OT>(questions: Answerable<AT> | Array<Answerable<AT>>, transformation: (...answers: AT[]) => OT): Transform<AT, OT> {
        return new Transform<AT, OT>([].concat(questions), transformation);
    }

    constructor(
        private readonly questions: Array<Answerable<Answer_Type>>,
        private readonly transformation: (...answers: Answer_Type[]) => Output_Type,
        private readonly description: string = `a transformed answer`,
    ) {
        super(description);
    }

    /**
     * @deprecated
     *  Please use {@link Transform#describedAs} instead
     *
     * @desc
     *  Overrides the default {@link Transform#toString} representation of this object.
     *
     * @param {string} description
     * @returns {Transform<Answer_Type, Output_Type>}
     */
    as(description: string): Transform<Answer_Type, Output_Type> {
        return this.describedAs(description);
    }

    /**
     * Changes the description of this question's subject.
     *
     * @param subject
     */
    describedAs(subject: string): this {
        this.subject = subject;

        return this;
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Output_Type> {
        return Promise.all(this.questions.map(question => actor.answer(question)))
            .then(answers => this.transformation(...answers));
    }
}
