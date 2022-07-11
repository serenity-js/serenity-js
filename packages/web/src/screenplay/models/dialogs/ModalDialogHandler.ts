import { ensure, isDefined } from 'tiny-types';

import { AbsentModalDialog } from './AbsentModalDialog';
import { ModalDialog } from './ModalDialog';

export abstract class ModalDialogHandler {

    /**
     * @param {ModalDialog} modalDialog
     * @protected
     */
    protected constructor(protected modalDialog: ModalDialog = new AbsentModalDialog()) {
        ensure('modalDialog', modalDialog, isDefined());
    }

    /**
     * @desc
     *  Configures the handler to accept the next JavaScript modal dialog.
     *
     * @returns {Promise<void>}
     */
    abstract acceptNext(): Promise<void>;

    /**
     * @desc
     *  Configures the handler to accept the next JavaScript `prompt``
     *  with a given `text` value.
     *
     * @returns {Promise<void>}
     */
    abstract acceptNextWithValue(text: string | number): Promise<void>;

    /**
     * @desc
     *  Configures the handler to dismiss the next JavaScript modal dialog.
     *
     * @returns {Promise<void>}
     */
    abstract dismissNext(): Promise<void>;

    /**
     * @desc
     *  Resets the handler to its default state.
     *
     * @returns {Promise<void>}
     */
    abstract reset(): Promise<void>;

    /**
     * @desc
     *  Returns the most recently handled {@link ModalDialog},
     *  or {@link AbsentModalDialog} when no dialogs have been handled yet.
     *
     * @returns {Promise<ModalDialog>}
     */
    async last(): Promise<ModalDialog> {
        return this.modalDialog;
    }
}
