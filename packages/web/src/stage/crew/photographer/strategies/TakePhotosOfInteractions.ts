import type { DomainEvent} from '@serenity-js/core/lib/events';
import { InteractionFinished } from '@serenity-js/core/lib/events';

import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * Configures the [`Photographer`](https://serenity-js.org/api/web/class/Photographer/) to take photos (a.k.a. screenshots)
 * when then [`Actor`](https://serenity-js.org/api/core/class/Actor/) in the [spotlight](https://serenity-js.org/api/core/function/actorInTheSpotlight/)
 * performs any [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
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
