import { ensure, isDefined } from 'tiny-types';

import { AbsentModalDialog } from './AbsentModalDialog';
import type { ModalDialog } from './ModalDialog';

/**
 * Represent the strategy to use with any upcoming {@apilink ModalDialog} windows.
 *
 * ## Learn more
 *
 * - {@apilink ModalDialog}
 * - {@apilink Page.modalDialog}
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
     * Returns the most recently handled {@apilink ModalDialog},
     * or {@apilink AbsentModalDialog} when no dialogs have been handled yet.
     */
    async last(): Promise<ModalDialog> {
        return this.modalDialog;
    }
}
