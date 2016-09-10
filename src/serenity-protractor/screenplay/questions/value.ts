import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { Target } from '../ui/target';
import { Attribute } from './attribute';

export class Value implements Question<string> {

    static of(target: Target) {
        return new Value(target);
    }

    answeredBy(actor: UsesAbilities) {
        return Attribute.of(this.target).called('value').answeredBy(actor);
    }

    constructor(private target: Target) {
    }
}
