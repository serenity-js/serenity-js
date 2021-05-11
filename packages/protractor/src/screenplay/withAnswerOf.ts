import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';

/**
 * @private
 * @param actor
 * @param maybeQuestion
 * @param fn
 */
export function withAnswerOf<T, O>(
    actor: AnswersQuestions & UsesAbilities,
    maybeQuestion: Question<T> | T,
    fn: (item: T) => O,
): O {
    const answer = Question.isAQuestion(maybeQuestion)
        ? maybeQuestion.answeredBy(actor)
        : maybeQuestion;

    return fn(answer);
}
