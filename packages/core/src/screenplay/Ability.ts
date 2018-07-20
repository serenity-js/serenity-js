import { UsesAbilities } from './actor';

export interface Ability {} // tslint:disable-line:no-empty-interface
export interface AbilityType<A extends Ability> {
    new (...args): A;
    as(actor: UsesAbilities): A;
}
