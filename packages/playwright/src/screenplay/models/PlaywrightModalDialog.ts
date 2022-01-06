import * as pw from 'playwright';
import { ModalDialog } from '@serenity-js/web';

export class PlaywrightModalDialog extends ModalDialog {
    public static from(dialog: pw.Dialog) {
        return new this(dialog);
    }

    private constructor(private readonly dialog: pw.Dialog) {
        super();
    }

    accept(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    dismiss(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    text(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    enterValue(value: string | number | (string | number)[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    isPresent(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
