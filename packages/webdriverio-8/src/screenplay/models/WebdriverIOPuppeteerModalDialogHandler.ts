import type {
    ModalDialog} from '@serenity-js/web';
import {
    AbsentModalDialog,
    AcceptedModalDialog,
    DismissedModalDialog,
    ModalDialogHandler
} from '@serenity-js/web';
import type { Dialog, Page } from 'puppeteer-core';

/**
 * WebdriverIO-specific implementation of [`ModalDialogHandler`](https://serenity-js.org/api/web/class/ModalDialogHandler/), applicable when WebdriverIO
 * uses [Puppeteer](https://developer.chrome.com/docs/puppeteer/).
 *
 * Automatically handles any simple JavaScript modal dialog windows, such as
 * those opened by [`window.alert()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert),
 * [`window.confirm()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm),
 * or [`window.prompt()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt).
 *
 * This helps to avoid Puppeteer hanging when there's an interaction pending
 * and a dialog is already open, see https://github.com/puppeteer/puppeteer/issues/2481
 */
export class WebdriverIOPuppeteerModalDialogHandler extends ModalDialogHandler {

    private dialogHandlingInProgress = false;

    private readonly defaultHandler: (dialog: Dialog) => Promise<ModalDialog> =
        async (dialog: Dialog) => {
            await dialog.dismiss();
            return new DismissedModalDialog(dialog.message());
        }

    private currentHandler: (dialog: Dialog) => Promise<ModalDialog>;

    constructor(private readonly page: Page) {
        super();

        this.currentHandler = this.defaultHandler;

        // remove the default WebdriverIO handler because it makes any other listeners hang
        // https://github.com/webdriverio/webdriverio/blob/518c56a61353b2f65436b83c618117021da7e622/packages/devtools/src/devtoolsdriver.ts#L69
        this.page.removeAllListeners('dialog');

        // register Serenity/JS handler instead
        this.page.on('dialog', async (dialog: Dialog) => {
            // Puppeteer doesn't seem to synchronise async handlers correctly,
            // hence the handleModalDialog wrapper and the `dialogHandlingInProgress` lock.
            await this.handleModalDialog(() => this.currentHandler(dialog));
        });
    }

    async acceptNext(): Promise<void> {
        this.currentHandler = async (dialog: Dialog) => {
            await dialog.accept(dialog.defaultValue());
            return new AcceptedModalDialog(dialog.message());
        }
    }

    async acceptNextWithValue(text: string | number): Promise<void> {
        this.currentHandler = async (dialog: Dialog) => {
            await dialog.accept(String(text));
            return new AcceptedModalDialog(dialog.message());
        }
    }

    async dismissNext(): Promise<void> {
        this.currentHandler = async (dialog: Dialog) => {
            await dialog.dismiss();
            return new DismissedModalDialog(dialog.message());
        }
    }

    async reset(): Promise<void> {
        this.modalDialog = new AbsentModalDialog();
        this.currentHandler = this.defaultHandler;
    }

    async discard(): Promise<void> {
        this.page.off('dialog', this.currentHandler);
    }

    async last(): Promise<ModalDialog> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (!this.dialogHandlingInProgress) {
                    clearInterval(interval);
                    resolve(this.modalDialog);
                }
            }, 25);
        });
    }

    private async handleModalDialog(handler: () => Promise<ModalDialog> | ModalDialog): Promise<void> {
        this.dialogHandlingInProgress = true;

        this.modalDialog = await handler();

        this.dialogHandlingInProgress = false;
    }
}
