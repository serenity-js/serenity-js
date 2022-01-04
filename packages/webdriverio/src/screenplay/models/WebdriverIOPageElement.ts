import { PageElement } from '@serenity-js/web';
import * as wdio from 'webdriverio';

export class WebdriverIOPageElement
    extends PageElement<wdio.Element<'async'>>
{
    of(parent: WebdriverIOPageElement): WebdriverIOPageElement {
        return new WebdriverIOPageElement(this.locator.of(parent.locator))
    }

    async clearValue(): Promise<void> {
        const element = await this.nativeElement();
        return element.clearValue();
    }

    async click(): Promise<void> {
        const element = await this.nativeElement();
        return element.click();
    }

    async doubleClick(): Promise<void> {
        const element = await this.nativeElement();
        return element.doubleClick();
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const element = await this.nativeElement();
        return element.addValue(value);
    }

    async scrollIntoView(): Promise<void> {
        const element = await this.nativeElement();
        return element.scrollIntoView();
    }

    async hoverOver(): Promise<void> {
        const element = await this.nativeElement();
        return element.moveTo();
    }

    async rightClick(): Promise<void> {
        const element = await this.nativeElement();
        return element.click({ button: 'right' });
    }

    async attribute(name: string): Promise<string> {
        const element = await this.nativeElement();
        return element.getAttribute(name);
    }

    async text(): Promise<string> {
        const element = await this.nativeElement();
        return element.getText();
    }

    async value(): Promise<string> {
        const element = await this.nativeElement();
        return element.getValue();
    }

    async isActive(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isFocused();
    }

    async isClickable(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isClickable();
    }

    async isEnabled(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isEnabled();
    }

    async isPresent(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isExisting();
    }

    async isSelected(): Promise<boolean> {
        const element = await this.nativeElement();
        return element.isSelected();
    }

    /**
     * @desc
     *  Checks if the PageElement:
     *  - is displayed,
     *  - is visible within the browser viewport,
     *  - has not its center covered by other elements
     *
     * @see https://webdriver.io/docs/api/element/isDisplayedInViewport/
     */
    async isVisible(): Promise<boolean> { // isVisible?
        const element = await this.nativeElement();

        if (! await element.isDisplayed()) {
            return false;
        }

        if (! await element.isDisplayedInViewport()) {
            return false;
        }

        const browser = await this.browserFor(element);

        /* eslint-disable no-var */

        // get element at cx/cy and see if the element we found is our element, and therefore it's visible.
        return browser.execute(
            /* istanbul ignore next */
            function isVisible(element: any) {
                if (! element.getBoundingClientRect) {
                    return false;
                }

                var
                    box = element.getBoundingClientRect(),
                    cx = box.left + box.width / 2,
                    cy = box.top + box.height / 2,
                    e = document.elementFromPoint(cx, cy);

                for (; e; e = e.parentElement) {
                    if (e === element)
                        return true;
                }
                return false;
            },
            element,
        );

        /* eslint-enable no-var */
    }

    // based on https://github.com/webdriverio/webdriverio/blob/dec6da76b0e218af935dbf39735ae3491d5edd8c/packages/webdriverio/src/utils/index.ts#L98
    private async browserFor(nativeElement: wdio.Element<'async'> | wdio.Browser<'async'>): Promise<wdio.Browser<'async'>> {
        const element = nativeElement as wdio.Element<'async'>;
        return element.parent
            ? this.browserFor(element.parent)
            : nativeElement
    }
}
