import { DomainEvent, InteractionFinished, InteractionStarts } from '@serenity-js/core/lib/events';

import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * Configures the {@link Photographer} to take photos (a.k.a. screenshots) **both before and after**
 * every single {@link Interaction} performed
 * by the {@link Actor} in the {@link actorInTheSpotlight|spotlight}.
 *
 * **Please note** that this strategy will result in _a lot_ of screenshots being taken,
 * which will seriously affect the performance of your tests.
 * For this reason, it's best to use it only for debugging purposes.
 *
 * @group Stage
 */
export class TakePhotosBeforeAndAfterInteractions extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionStarts
            || event instanceof InteractionFinished;
    }

    protected photoNameFor(event: InteractionStarts | InteractionFinished): string {
        return event instanceof InteractionStarts
            ? `Before ${ event.details.name.value }`
            : `After ${ event.details.name.value }`;
    }
}
