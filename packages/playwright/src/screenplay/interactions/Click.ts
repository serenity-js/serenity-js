import {
    Answerable,
    AnswersQuestions,
    Interaction,
    PerformsActivities,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementHandle } from 'playwright';

import { ClickOptions } from '../options/clickOptions';

export class Click extends Interaction {
    static on(target: Answerable<ElementHandle>): Interaction & {
        withOptions: (options: ClickOptions) => Interaction;
    } {
        return new Click(target);
    }

    private constructor(
        private readonly target: Answerable<ElementHandle>,
        private readonly options?: ClickOptions
    ) {
        super();
    }

    public withOptions(options: ClickOptions): Interaction {
        return new Click(this.target, options);
    }

    public async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const targetAnswered = await actor.answer(this.target);

        await targetAnswered.click(this.options);
    }

    toString(): string {
        return formatted`#actor clicks on ${this.target}`;
    }
}
