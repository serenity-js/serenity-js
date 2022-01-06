import * as pw from 'playwright';
import { ModalDialog } from '@serenity-js/web';

export class PlaywrightModalDialog extends ModalDialog {
    public static from(dialog: pw.Dialog) {
        return new this(dialog);
    }

    private _isPresent: boolean;
    private valueToEnter: string;

    private constructor(private readonly dialog: pw.Dialog) {
        super();
        this._isPresent = true;
    }

    async accept(): Promise<void> {
        await this.dialog.accept(this.valueToEnter);
        this.notPresent();
    }

    async dismiss(): Promise<void> {
        await this.dialog.dismiss();
        this.notPresent();
    }

    async text(): Promise<string> {
        return this.dialog.message();
    }

    async enterValue(value: string | number | (string | number)[]): Promise<void> {
        this.valueToEnter = value.toString();
    }

    async isPresent(): Promise<boolean> {
        return this._isPresent;
    }

    private notPresent() {
        this._isPresent = false;
    }
}
