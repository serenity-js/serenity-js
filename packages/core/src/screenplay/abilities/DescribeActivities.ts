import { asyncMap } from '../../io';
import type { DescribesActivities } from '../activities';
import type { Answerable } from '../Answerable';
import { Description } from '../Description';
import type { AnswersQuestions } from '../questions/AnswersQuestions';
import type { DescriptionOptions } from '../questions/descriptions';
import { parameterDescriptionText } from '../questions/descriptionText';
import { Ability } from './Ability';
import type { UsesAbilities } from './UsesAbilities';

/**
 * This {@apilink Ability} enables an {@apilink Actor} to describe an {@apilink Activity} or an {@apilink Answerable}.
 *
 * {@apilink DescribeActivities} is used internally by {@apilink Actor.attemptTo}, and it is unlikely you'll ever need to use it directly in your code.
 * That is, unless you're building a custom Serenity/JS extension and want to override the default behaviour of the framework,
 * in which case you should check out the [Contributor's Guide](/contributing).
 *
 * @group Abilities
 */
export class DescribeActivities extends Ability {

    // protected readonly describers: Describers;
    
    constructor(
        protected readonly actor: AnswersQuestions & DescribesActivities & UsesAbilities,
        protected readonly /* todo field -> parameter */ options: DescriptionOptions,
    ) {
        super();

        // this.describers = new Describers(options);
    }

    async describe(answerable: Answerable<string>): Promise<Description> {
        if (Description.isDescribable(answerable)) {
            return answerable.describedBy(this.actor);
        }

        if (Array.isArray(answerable)) {
            const items = await asyncMap(answerable, async answerableItem => {
                const description = await this.describe(answerableItem);
                return description.value;
            })
            // todo: extract "parameterDescriptionTextForArray"
            // return new Description(parameterDescriptionText(this.options)(items));
            return new Description(`[ ${ items.join(', ') } ]`);
        }

        // todo is object, set, Map etc

        const answer = await this.actor.answer(answerable);

        return new Description(parameterDescriptionText(this.options)(answer));

        // todo: replace #actor token with actor name
    }
}
