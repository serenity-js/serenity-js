import type { Actor, Answerable } from '@serenity-js/core';
import { Interaction, the } from '@serenity-js/core';

import type { PageElement } from '../models';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to drag a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) and drop it on another [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * ## Example draggable and drop zone
 *
 * ```html
 * <p id="draggable" draggable="true" ondragstart="dragstartHandler(event)">
 *   This element is draggable.
 * </p>
 * <div
 *   id="droppable"
 *   ondrop="dropHandler(event)"
 *   ondragover="dragoverHandler(event)">
 *   Drop Zone
 * </div>
 * ```
 *
 * ## Page Elements for draggable and drop zone
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const draggable = () => PageElement.located(By.css('#draggable')).describedAs('draggable element');
 * const dropZone = () => PageElement.located(By.css('#droppable')).describedAs('drop zone element');
 * ```
 *
 * ## Dragging and dropping the element
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Drag, Navigate, Text } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Doug')
 *   .attemptsTo(
 *     Navigate.to('https://jqueryui.com/resources/demos/droppable/default.html'),
 *     Drag.element(draggable()).to(dropZone()),
 *     Ensure.that(Text.of(dropZone()), equals('Dropped!'))
 *   )
 * ```
 *
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) reference on MDN
 *
 * @group Activities
 */
export class Drag {

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to drag a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) and drop it on another [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * Call [`.to(...)`](https://serenity-js.org/api/web/class/Drag/#to) to specify the destination.
     * @param draggable the element that will be dragged
     */
    static the(draggable: Answerable<PageElement>): Drag {
        return new Drag(draggable);
    }

    private constructor(private readonly draggable: Answerable<PageElement>) {}

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to drag a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) and drop it on another [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * @param destination the element to drop it on
     */
    to(destination: Answerable<PageElement>): Interaction {
        return new DragAndDrop(this.draggable, destination)
    }
}

/**
 * @package
 */
class DragAndDrop extends Interaction {
    constructor(
        private readonly draggable: Answerable<PageElement>,
        private readonly destination: Answerable<PageElement>,
    ) {
        super(the `#actor drags ${ draggable } and drops it on ${ destination }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: Actor): Promise<void> {
        const draggable = await actor.answer(this.draggable);
        const destination = await actor.answer(this.destination);

        await draggable.dragTo(destination);
    }
}
