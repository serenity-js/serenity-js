import { UsesAbilities } from './actor';

export interface Question<T> {
    answeredBy(actor: UsesAbilities): T;
}
