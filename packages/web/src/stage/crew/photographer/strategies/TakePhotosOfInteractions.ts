import type { DomainEvent} from '@serenity-js/core/lib/events';
import { InteractionFinished } from '@serenity-js/core/lib/events';

import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * Configures the {@apilink Photographer} to take photos (a.k.a. screenshots)
 * when then {@apilink Actor} in the {@apilink actorInTheSpotlight|spotlight}
 * performs any {@apilink Interaction}.
 *
 * This strategy works best when you want the results of your automated tests
 * to become comprehensive living documentation of your system.
 *
 * *Please note* that taking screenshots affects the performance of your tests.
 *
 * @group Stage
 */
export class TakePhotosOfInteractions extends PhotoTakingStrategy {
    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        return event instanceof InteractionFinished;
    }

    protected photoNameFor(event: InteractionFinished): string {
        return event.details.name.value;
    }
}
