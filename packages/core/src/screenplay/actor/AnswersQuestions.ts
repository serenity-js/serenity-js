import { KnownUnknown } from '../KnownUnknown';

export interface AnswersQuestions {
    answer<T>(knownUnknown: KnownUnknown<T>): Promise<T>;
}
