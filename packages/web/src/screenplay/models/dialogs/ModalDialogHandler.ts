import { ensure, isDefined } from 'tiny-types';

import { AbsentModalDialog } from './AbsentModalDialog';
import type { ModalDialog } from './ModalDialog';

/**
 * Represent the strategy to use with any upcoming [`ModalDialog`](https://serenity-js.org/api/web/class/ModalDialog/) windows.
 *
 * ## Learn more
 *
 * - [`ModalDialog`](https://serenity-js.org/api/web/class/ModalDialog/)
 * - [`Page.modalDialog`](https://serenity-js.org/api/web/class/Page/#modalDialog)
 *
 * @group Models
 */
export abstract class ModalDialogHandler {

    protected constructor(protected modalDialog: ModalDialog = new AbsentModalDialog()) {
        ensure('modalDialog', modalDialog, isDefined());
    }

    /**
     * Configures the handler to accept the next JavaScript modal dialog.
     */
    abstract acceptNext(): Promise<void>;

    /**
     * Configures the handler to accept the next JavaScript `prompt``
     * with a given `text` value.
     */
    abstract acceptNextWithValue(text: string | number): Promise<void>;

    /**
     * Configures the handler to dismiss the next JavaScript modal dialog.
     */
    abstract dismissNext(): Promise<void>;

    /**
     * Resets the handler to its default state.
     */
    abstract reset(): Promise<void>;

    /**
     * Returns the most recently handled [`ModalDialog`](https://serenity-js.org/api/web/class/ModalDialog/),
     * or [`AbsentModalDialog`](https://serenity-js.org/api/web/class/AbsentModalDialog/) when no dialogs have been handled yet.
     */
    async last(): Promise<ModalDialog> {
        return this.modalDialog;
    }
}
