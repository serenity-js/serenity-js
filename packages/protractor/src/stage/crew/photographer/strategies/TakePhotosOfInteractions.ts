import { DomainEvent, InteractionFinished } from '@serenity-js/core/lib/events';
import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * @desc
 *  Configures the {@link Photographer} to take photos (a.k.a. screenshots) when
 *  the the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight
 *  performs any {@link @serenity-js/core/lib/screenplay~Interaction}.
 *
 *  This strategy works best when you want the results of your automated tests
 *  to become comprehensive living documentation of your system.
 *
 *  *Please note* that taking screenshots affects the performance of your tests.
 *
 * @implements {PhotoTakingStrategy}
 */
export class TakePhotosOfInteractions extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionFinished;
    }

    protected photoNameFor(event: InteractionFinished): string {
        return event.details.name.value;
    }
}
