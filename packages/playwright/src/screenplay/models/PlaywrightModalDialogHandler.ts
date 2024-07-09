import type { ModalDialog} from '@serenity-js/web';
import { AbsentModalDialog, AcceptedModalDialog, DismissedModalDialog, ModalDialogHandler } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

/**
 * Playwright-specific implementation of [`ModalDialogHandler`](https://serenity-js.org/api/web/class/ModalDialogHandler/).
 *
 * @group Models
 */
export class PlaywrightModalDialogHandler extends ModalDialogHandler {

    private readonly defaultHandler: (dialog: playwright.Dialog) => Promise<ModalDialog> =
        async (dialog: playwright.Dialog) => {
            await dialog.dismiss();
            return new DismissedModalDialog(dialog.message());
        }

    private currentHandler: (dialog: playwright.Dialog) => Promise<ModalDialog>;

    constructor(private readonly page: playwright.Page) {
        super();

        this.currentHandler = this.defaultHandler;

        this.page.on('dialog', async (dialog: playwright.Dialog) => {
            this.modalDialog = await this.currentHandler(dialog);
        });
    }

    async acceptNext(): Promise<void> {
        this.currentHandler = async (dialog: playwright.Dialog) => {
            await dialog.accept(dialog.defaultValue());
            return new AcceptedModalDialog(dialog.message());
        }
    }

    async acceptNextWithValue(text: string | number): Promise<void> {
        this.currentHandler = async (dialog: playwright.Dialog) => {
            await dialog.accept(String(text));
            return new AcceptedModalDialog(dialog.message());
        }
    }

    async dismissNext(): Promise<void> {
        this.currentHandler = async (dialog: playwright.Dialog) => {
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
