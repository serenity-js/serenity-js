import { UsesAbilities } from './actor';

export interface Question<T> {
    answeredBy(actor: UsesAbilities): Promise<T>|T;
}
