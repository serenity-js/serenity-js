import { AnswersQuestions, UsesAbilities } from './actor';
import { Question } from './Question';

export class Answer<T, Mapped_T = T> implements Question<Mapped_T> {
    static to<I>(question: Question<I>) {
        return new Answer<I, I>(question, _ => _);
    }

    mappedAs<M_T>(fn: (value: T) => M_T) {
        return new Answer<T, M_T>(this.question, fn);
    }

    constructor(
        private readonly question: Question<T>,
        private readonly mapper: (value: T) => Mapped_T,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Mapped_T {
        return this.mapper(this.question.answeredBy(actor));
    }
}
