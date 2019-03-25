import { DomainEvent, InteractionFinished } from '@serenity-js/core/lib/events';
import { PhotoTakingStrategy } from './PhotoTakingStrategy';

export class TakePhotosOfInteractions extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionFinished;
    }

    protected photoNameFor(event: InteractionFinished): string {
        return event.value.name.value;
    }
}
