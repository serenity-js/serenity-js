import type { Answerable } from '../Answerable';
import { Question } from '../Question';
import type { AnswersQuestions } from '../questions';
import { Ability } from './Ability';
import type { UsesAbilities } from './UsesAbilities';

/**
 * This {@apilink Ability} enables an {@apilink Actor} to resolve the value of a given {@apilink Answerable}.
 *
 * {@apilink AnswerQuestions} is used internally by {@apilink Actor.answer}, and it is unlikely you'll ever need to use it directly in your code.
 * That is, unless you're building a custom Serenity/JS extension and want to override the default behaviour of the framework,
 * in which case you should check out the [Contributor's Guide](/contributing).
 *
 * @group Abilities
 */
export class AnswerQuestions extends Ability {
    constructor(protected readonly actor: AnswersQuestions & UsesAbilities) {
        super();
    }

    answer<T>(answerable: Answerable<T>): Promise<T> {

        if (AnswerQuestions.isDefined(answerable) && AnswerQuestions.isAPromise(answerable)) {
            return answerable;
        }

        if (AnswerQuestions.isDefined(answerable) && Question.isAQuestion(answerable)) {
            return this.answer(answerable.answeredBy(this.actor));
        }

        return Promise.resolve(answerable as T);
    }

    private static isAPromise<V>(v: Answerable<V>): v is Promise<V> {
        return Object.prototype.hasOwnProperty.call(v, 'then');
    }

    private static isDefined<V>(v: Answerable<V>) {
        return !(v === undefined || v === null);
    }
}
