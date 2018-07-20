import { Question } from '../Question';

export interface AnswersQuestions {
    toSee<T>(question: Question<T>): T;
}
