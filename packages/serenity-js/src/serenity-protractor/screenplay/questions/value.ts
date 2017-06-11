import { Question, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { Target } from '../ui/target';
import { Attribute } from './attribute';

export class Value implements Question<PromiseLike<string>> {

    static of = (target: Target) => new Value(target);

    answeredBy(actor: UsesAbilities) {
        return Attribute.of(this.target).called('value').answeredBy(actor);
    }

    constructor(private target: Target) {
    }

    toString = () => `the value of ${ this.target}`;
}
