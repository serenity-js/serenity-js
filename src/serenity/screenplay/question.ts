import { UsesAbilities } from './actor';

export interface Question<T> {
    answeredBy(actor: UsesAbilities): PromiseLike<T>|T;
}
