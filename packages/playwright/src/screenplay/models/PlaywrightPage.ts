import * as pw from 'playwright';

import { Page } from "@serenity-js/web";
import { URL } from "url";

export class PlaywrightPage extends Page {
    public static from(originalPage: pw.Page, handle: string) {
        return new this(originalPage, handle);
    }

    private constructor(
        private readonly originalPage: pw.Page,
        handle: string
    ) {
        super(handle);
    }

    title(): Promise<string> {
        return this.originalPage.title();
    }

    async url(): Promise<URL> {
        return new URL(this.originalPage.url());
    }

    async name(): Promise<string> {
        const name = await this.originalPage.evaluate<string>('window.name');
        return name;
    }

    async isPresent(): Promise<boolean> {
        return !this.originalPage.isClosed();
    }

    async viewportSize(): Promise<{ width: number; height: number; }> {
        return this.originalPage.viewportSize();
    }

    setViewportSize(size: { width: number; height: number; }): Promise<void> {
        return this.originalPage.setViewportSize(size);
    }

    switchTo(): Promise<void> {
        return this.originalPage.bringToFront();
    }

    close(): Promise<void> {
        return this.originalPage.close();
    }

    async closeOthers(): Promise<void> {
        const context = this.originalPage.context();
        const pages = context.pages();
        await Promise.all(pages
            .filter((page) => page !== this.originalPage)
            .map((page) => page.close()));
    }
}
