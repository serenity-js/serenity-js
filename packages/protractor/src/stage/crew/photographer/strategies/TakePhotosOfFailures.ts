import { DomainEvent, InteractionFinished } from '@serenity-js/core/lib/events';
import { ImplementationPending } from '@serenity-js/core/lib/model';
import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * @desc
 *  Configures the {@link Photographer} to take photos (a.k.a. screenshots) when
 *  the {@link @serenity-js/core/lib/screenplay~Interaction} performed
 *  by the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight results in an error.
 *
 *  This strategy works best when you are interested in the screenshots only when
 *  the a fails.
 *
 * @implements {PhotoTakingStrategy}
 */
export class TakePhotosOfFailures extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionFinished
            && event.outcome.isWorseThan(ImplementationPending);
    }

    protected photoNameFor(event: InteractionFinished): string {
        return event.details.name.value;
    }
}
