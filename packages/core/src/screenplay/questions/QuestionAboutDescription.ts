import type { UsesAbilities } from '../abilities';
import type { DescribesActivities } from '../activities';
import type { Answerable } from '../Answerable';
import { Description } from '../Description';
import { Question, type QuestionAdapter } from '../Question';
import type { AnswersQuestions } from './AnswersQuestions';
import type { DescriptionOptions } from './descriptions/DescriptionOptions';
import { parameterDescriptionText } from './descriptionText';
import type { MetaQuestion } from './MetaQuestion';

export class QuestionAboutDescription implements
    MetaQuestion<
    Answerable<any>,
    QuestionAdapter<string> & MetaQuestion<Answerable<any>, Question<Promise<string>>>
    >
{

    constructor(private readonly options: DescriptionOptions) {
    }

    of(answerable: Answerable<any> & MetaQuestion<Answerable<any>, Answerable<any>>): QuestionAdapter<string> & QuestionAboutDescription
    of(answerable: Answerable<any>): QuestionAdapter<string> {
        return Question.about(this.toString(),
            async (actor: AnswersQuestions & DescribesActivities & UsesAbilities) => {
                if (Description.isDescribable(answerable)) {
                    const result = await answerable.describedBy(actor);
                    return result.value;
                }

                // todo: refactor the parameterDescriptionText function
                const result = parameterDescriptionText(this.options)(
                    // answerable
                    await actor.answer(answerable)
                )

                return result;
            },
            (context: Answerable<any>) =>
                Question.about(this.toString(), async actor => {
                    // todo: refactor the parameterDescriptionText function
                    const result = parameterDescriptionText(this.options)(
                        await actor.answer(
                            (answerable as MetaQuestion<Answerable<any>, Answerable<any>>)
                                .of(context)
                        )
                    )
                    return result;
                })
        );
    }

    toString(): string {
        return `description`;
    }
}