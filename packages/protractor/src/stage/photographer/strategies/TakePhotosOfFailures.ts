import { DomainEvent, InteractionFinished } from '@serenity-js/core/lib/events';
import { ImplementationPending } from '@serenity-js/core/lib/model';
import { PhotoTakingStrategy } from './PhotoTakingStrategy';

export class TakePhotosOfFailures extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionFinished
            && event.outcome.isWorseThan(ImplementationPending);
    }

    protected photoNameFor(event: InteractionFinished): string {
        return event.value.name.value;
    }
}
