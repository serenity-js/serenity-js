import { ensure, isDefined } from 'tiny-types';

import { AbsentModalDialog } from './AbsentModalDialog';
import { ModalDialog } from './ModalDialog';

/**
 * Represent the strategy to use with any upcoming {@link ModalDialog} windows.
 *
 * ## Learn more
 *
 * - {@link ModalDialog}
 * - [[Page.modalDialog]]
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
     * Returns the most recently handled {@link ModalDialog},
     * or {@link AbsentModalDialog} when no dialogs have been handled yet.
     */
    async last(): Promise<ModalDialog> {
        return this.modalDialog;
    }
}
