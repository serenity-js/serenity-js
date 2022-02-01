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

        /* eslint-disable no-var,unicorn/consistent-function-scoping,unicorn/prevent-abbreviations,@typescript-eslint/ban-ts-comment,unicorn/no-for-loop,prefer-const */

        // get element at cx/cy and see if the element we found is our element, and therefore it's visible.
        return browser.execute(
            /* istanbul ignore next */
            function isVisible(element: any) {

                if (!element.getBoundingClientRect || !element.scrollIntoView || !element.contains || !element.getClientRects || !document.elementFromPoint) {
                    return false
                }

                // Edge before switching to Chromium
                const isOldEdge = !!window['StyleMedia']

                // get overlapping element
                function getOverlappingElement (elem: HTMLElement, context?: Document) {
                    context = context || document
                    const elemDimension = elem.getBoundingClientRect()
                    const x = elemDimension.left + (elem.clientWidth / 2)
                    const y = elemDimension.top + (elem.clientHeight / 2)
                    return context.elementFromPoint(x, y)
                }

                // get overlapping element rects (currently only the first)
                // applicable if element's text is multiline.
                function getOverlappingRects (elem: HTMLElement, context?: Document) {
                    context = context || document
                    const elems = []

                    const rects = elem.getClientRects()
                    // webdriver clicks on center of the first element's rect (line of text), it might change in future
                    const rect = rects[0]
                    const x = rect.left + (rect.width / 2)
                    const y = rect.top + (rect.height / 2)
                    elems.push(context.elementFromPoint(x, y))

                    return elems
                }

                // get overlapping elements
                function getOverlappingElements (elem: HTMLElement, context?: Document) {
                    return [getOverlappingElement(elem, context)].concat(getOverlappingRects(elem, context))
                }

                // is a node a descendant of a given node
                function nodeContains (elem: HTMLElement, otherNode: HTMLElement) {
                    // Edge doesn't support neither Shadow Dom nor contains if ShadowRoot polyfill is used
                    if (isOldEdge) {
                        let tmpElement = otherNode as HTMLElement | ShadowRoot | Element
                        while (tmpElement) {
                            if (tmpElement === elem) {
                                return true
                            }

                            tmpElement = tmpElement.parentNode as ShadowRoot
                            // DocumentFragment / ShadowRoot polyfill like ShadyRoot
                            if (tmpElement && tmpElement.nodeType === 11 && tmpElement.host) {
                                tmpElement = tmpElement.host
                            }
                        }
                        return false
                    }

                    return elem.contains(otherNode)
                }

                // is one of overlapping elements the `elem` or one of its child
                function isOverlappingElementMatch (elementsFromPoint: HTMLElement[], elem: HTMLElement): boolean {
                    if (elementsFromPoint.some(function (elementFromPoint) {
                        return elementFromPoint === elem || nodeContains(elem, elementFromPoint)
                    })) {
                        return true
                    }

                    // shadow root
                    // filter unique elements with shadowRoot
                    // @ts-ignore
                    let elemsWithShadowRoot = [].concat(elementsFromPoint)
                    elemsWithShadowRoot = elemsWithShadowRoot.filter(function (x: HTMLElement) {
                        return x && x.shadowRoot && x.shadowRoot.elementFromPoint
                    })

                    // getOverlappingElements of every element with shadowRoot
                    let shadowElementsFromPoint: HTMLElement[] = []
                    for (let i = 0; i < elemsWithShadowRoot.length; ++i) {
                        let shadowElement = elemsWithShadowRoot[i]
                        shadowElementsFromPoint = shadowElementsFromPoint.concat(
                            getOverlappingElements(elem, (shadowElement as HTMLElement).shadowRoot as any) as any
                        )
                    }
                    // remove duplicates and parents
                    // @ts-ignore
                    shadowElementsFromPoint = [].concat(shadowElementsFromPoint)
                    shadowElementsFromPoint = shadowElementsFromPoint.filter(function (x) {
                        return !elementsFromPoint.includes(x)
                    })

                    if (shadowElementsFromPoint.length === 0) {
                        return false
                    }

                    return isOverlappingElementMatch(shadowElementsFromPoint, elem)
                }

                return isOverlappingElementMatch(getOverlappingElements(element) as any as HTMLElement[], element)
            },
            element,
        );

        /* eslint-enable no-var,unicorn/consistent-function-scoping,unicorn/prevent-abbreviations,@typescript-eslint/ban-ts-comment,unicorn/no-for-loop,prefer-const */
    }

    // based on https://github.com/webdriverio/webdriverio/blob/dec6da76b0e218af935dbf39735ae3491d5edd8c/packages/webdriverio/src/utils/index.ts#L98
    private async browserFor(nativeElement: wdio.Element<'async'> | wdio.Browser<'async'>): Promise<wdio.Browser<'async'>> {
        const element = nativeElement as wdio.Element<'async'>;
        return element.parent
            ? this.browserFor(element.parent)
            : nativeElement
    }
}
