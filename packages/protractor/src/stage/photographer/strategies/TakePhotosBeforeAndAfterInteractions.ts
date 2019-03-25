import { DomainEvent, InteractionFinished, InteractionStarts } from '@serenity-js/core/lib/events';
import { ImplementationPending } from '@serenity-js/core/lib/model';
import { PhotoTakingStrategy } from './PhotoTakingStrategy';

export class TakePhotosBeforeAndAfterInteractions extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionStarts
            || event instanceof InteractionFinished;
    }

    protected photoNameFor(event: InteractionStarts | InteractionFinished): string {
        return event instanceof InteractionStarts
            ? `Before ${ event.value.name.value }`
            : `After ${ event.value.name.value }`;
    }
}
