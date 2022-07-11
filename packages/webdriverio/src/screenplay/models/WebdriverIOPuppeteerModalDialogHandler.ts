import { AbsentModalDialog, AcceptedModalDialog, DismissedModalDialog, ModalDialog, ModalDialogHandler } from '@serenity-js/web';
import type { Dialog } from 'puppeteer-core/lib/cjs/puppeteer/common/Dialog';
import type { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';

/**
 * @desc
 *  Automatically handles any simple JavaScript modal dialog windows, such as
 *  those opened by {@link window.alert}, {@link window.confirm}, or {@link window.prompt}.
 *
 *  This helps to avoid Puppeteer hanging when there's an interaction pending
 *  and a dialog is already open, see https://github.com/puppeteer/puppeteer/issues/2481
 *
 * @extends {@link @serenity-js/web/lib/screenplay/models/dialogs~ModalDialogHandler}
 */
export class WebdriverIOPuppeteerModalDialogHandler extends ModalDialogHandler {

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
            this.modalDialog = await this.currentHandler(dialog);
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
}
