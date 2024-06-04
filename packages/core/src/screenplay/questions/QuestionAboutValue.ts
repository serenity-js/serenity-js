import type { UsesAbilities } from '../abilities';
import type { DescribesActivities } from '../activities';
import type { Answerable } from '../Answerable';
import { Question, type QuestionAdapter } from '../Question';
import type { AnswersQuestions } from './AnswersQuestions';
import type { MetaQuestion } from './MetaQuestion';

export class QuestionAboutValue<Answer_Type> implements
    MetaQuestion<
    Answerable<Answer_Type>,
    QuestionAdapter<Awaited<Answer_Type>> & MetaQuestion<Answerable<Answer_Type>, Question<Promise<Awaited<Answer_Type>>>>
    >
{
    of(answerable: Answerable<Answer_Type> & MetaQuestion<Answerable<Answer_Type>, Question<Promise<Awaited<Answer_Type>>>>): QuestionAdapter<Awaited<Answer_Type>> & MetaQuestion<Answerable<Answer_Type>, Question<Promise<Awaited<Answer_Type>>>>
    of(answerable: Answerable<Answer_Type>): QuestionAdapter<Awaited<Answer_Type>> {
        return Question.about(String(answerable),
            async (actor: AnswersQuestions & DescribesActivities & UsesAbilities) => {
                return await actor.answer(answerable);
            },
            (context: Answerable<any>) =>
                Question.about(String(context), async actor => {
                    return await actor.answer(
                        Question.isAMetaQuestion(answerable)
                            ? (answerable as MetaQuestion<Answerable<any>, Answerable<any>>).of(context)
                            : context
                    );
                })
        );
    }

    toString(): string {
        return `value`;
    }
}