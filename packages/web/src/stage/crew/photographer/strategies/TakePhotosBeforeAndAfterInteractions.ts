import type { DomainEvent} from '@serenity-js/core/lib/events';
import { InteractionFinished, InteractionStarts } from '@serenity-js/core/lib/events';

import { PhotoTakingStrategy } from './PhotoTakingStrategy';

/**
 * Configures the [`Photographer`](https://serenity-js.org/api/web/class/Photographer/) to take photos (a.k.a. screenshots) **both before and after**
 * every single [`Interaction`](https://serenity-js.org/api/core/class/Interaction/) performed
 * by the [`Actor`](https://serenity-js.org/api/core/class/Actor/) in the [spotlight](https://serenity-js.org/api/core/function/actorInTheSpotlight/).
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
