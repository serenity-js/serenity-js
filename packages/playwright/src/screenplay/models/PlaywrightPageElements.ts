import {LogicError} from "@serenity-js/core";
import { PageElement, PageElements } from "@serenity-js/web";
import * as pw from "playwright";
import { PlaywrightNativeRootElement } from "./PlaywrightNativeRootElement";
import { PlaywrightPageElement } from "./PlaywrightPageElement";

export class PlaywrightPageElements
    extends PageElements<PlaywrightNativeRootElement, pw.ElementHandle[], pw.ElementHandle>
{
    of(parent: PlaywrightPageElement): PlaywrightPageElements {
        return new PlaywrightPageElements(() => parent.nativeElement(), this.locator);
    }

    async count(): Promise<number> {
        const elements = await this.nativeElementList();
        return elements.length;
    }

    first(): Promise<PageElement<PlaywrightNativeRootElement, pw.ElementHandle<Node>>> {
        return this.elementAt(0);
    }

    async last(): Promise<PageElement<PlaywrightNativeRootElement, pw.ElementHandle<Node>>> {
        const elements = await this.nativeElementList();
        const index = elements.length - 1;

        return this.elementAt(index);
    }

    get(index: number): Promise<PageElement<PlaywrightNativeRootElement, pw.ElementHandle<Node>>> {
        return this.elementAt(index);
    }

    async map<O>(fn: (element: PageElement<any, any>, index?: number, elements?: PageElements<any, any, any>) => O | Promise<O>): Promise<O[]> {
        const elements = await this.nativeElementList();

        return Promise.all(
            elements.map((element, index) =>
                fn(new PlaywrightPageElement(this.context, () => element), index, this)
            )
        );
    }

    filter(fn: (element: PageElement<any, any>, index?: number) => boolean | Promise<boolean>): PageElements<any, any, any> {
        return new PlaywrightPageElements(this.context, async context => {
            const elements = await this.locator(context);

            const matching = await Promise.all(
                elements.map(async (nativeElement: pw.ElementHandle, index: number) => {
                    const element = new PlaywrightPageElement(this.context, () => nativeElement);
                    const matches = await fn(element, index);

                    return matches
                        ? nativeElement
                        : undefined;
                })
            );

            const results = matching.filter((element: pw.ElementHandle | undefined) => {
                return element !== undefined;
            }) as pw.ElementHandle[];

            return results;
        });
    }

    async forEach(fn: (element: PageElement<any, any>, index?: number) => void | Promise<void>): Promise<void> {
        const elements = await this.nativeElementList();

        return elements.reduce(async (previous: Promise<void>, element: pw.ElementHandle, index: number) => {
            await previous;
            return fn(new PlaywrightPageElement(this.context, () => element), index);
        }, Promise.resolve());
    }

    private async elementAt(index: number): Promise<PlaywrightPageElement> {
        const elements = await this.nativeElementList();

        if (! elements[index]) {
            throw new LogicError(`There's no item at index ${ index }`);
        }

        return new PlaywrightPageElement(this.context, () => elements[index])
    }
}
