import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * @experimental
 */
export class Transform<Answer_Type extends any, Output_Type> implements Question<Promise<Output_Type>> {
    static the<AT extends any, OT>(questions: Answerable<AT> | Array<Answerable<AT>>, transformation: (...answers: AT[]) => OT) {
        return new Transform<AT, OT>([].concat(questions), transformation);
    }

    constructor(
        private readonly questions: Array<Answerable<Answer_Type>>,
        private readonly transformation: (...answers: Answer_Type[]) => Output_Type,
        private readonly description: string = `a transformed answer`,
    ) {
    }

    /**
     * @desc
     *  Overrides the default {@link Transform#toString} representation of this object.
     *
     * @param {string} description
     * @returns {Transform}
     */
    as(description: string) {
        return new Transform(this.questions, this.transformation, description);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Output_Type> {
        return Promise.all(this.questions.map(question => actor.answer(question)))
            .then(answers => this.transformation(...answers));
    }

    toString() {
        return this.description;
    }
}
