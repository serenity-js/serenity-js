import { DomainEvent, InteractionFinished, InteractionStarts } from '@serenity-js/core/lib/events';
import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * @desc
 *  Configures the {@link Photographer} to take photos (a.k.a. screenshots) both before and after
 *  every single {@link @serenity-js/core/lib/screenplay~Interaction} performed
 *  by the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight.
 *
 *  *Please note* that this strategy will result in _a lot_ of screenshots being taken,
 *  which will seriously affect the performance of your tests.
 *  For this reason, it's best to use it only for debugging purposes.
 *
 * @implements {PhotoTakingStrategy}
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
