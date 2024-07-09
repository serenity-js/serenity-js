import type { DomainEvent} from '@serenity-js/core/lib/events';
import { InteractionFinished } from '@serenity-js/core/lib/events';
import { ImplementationPending } from '@serenity-js/core/lib/model';

import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * Configures the [`Photographer`](https://serenity-js.org/api/web/class/Photographer/) to take photos (a.k.a. screenshots)
 * when then [`Interaction`](https://serenity-js.org/api/core/class/Interaction/) performed
 * by the [`Actor`](https://serenity-js.org/api/core/class/Actor/) in the [spotlight](https://serenity-js.org/api/core/function/actorInTheSpotlight/)
 * results in an error.
 *
 * This strategy works best when you are interested in the screenshots only when
 * a scenario fails.
 *
 * @group Stage
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
