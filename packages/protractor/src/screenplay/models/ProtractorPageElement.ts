import { PageElement } from '@serenity-js/web';
import { ElementFinder, protractor } from 'protractor';
import { WebElement } from 'selenium-webdriver';

import { promised } from '../promised';

export class ProtractorPageElement
    extends PageElement<ElementFinder>
{
    of(parent: ProtractorPageElement): PageElement<ElementFinder> {
        return new ProtractorPageElement(this.locator.of(parent.locator));
    }

    async clearValue(): Promise<void> {
        function removeCharactersFrom(elf: ElementFinder, numberOfCharacters: number): PromiseLike<void> {
            return numberOfCharacters === 0
                ? Promise.resolve(void 0)
                : elf.sendKeys(
                    protractor.Key.END,
                    ...times(numberOfCharacters, protractor.Key.BACK_SPACE),
                );
        }

        // eslint-disable-next-line unicorn/consistent-function-scoping
        function times(length: number, key: string) {
            return Array.from({ length }).map(() => key);
        }

        const currentValue = await this.value();

        if (currentValue !== null && currentValue !== undefined) {
            const element = await this.nativeElement();
            return removeCharactersFrom(element, currentValue.length);
        }
    }

    async click(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        return element.click();
    }

    async doubleClick(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .doubleClick()
                .perform()
        );
    }

    async enterValue(value: string | number | Array<string | number>): Promise<void> {
        const element: ElementFinder = await this.nativeElement();

        return element.sendKeys(
            [].concat(value).join('')
        );
    }

    async scrollIntoView(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().executeScript('arguments[0].scrollIntoView(true);', webElement)
        );
    }

    async hoverOver(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .perform()
        );
    }

    async rightClick(): Promise<void> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(
            webElement.getDriver().actions()
                .mouseMove(webElement)
                .click(protractor.Button.RIGHT)
                .perform()
        );
    }

    async attribute(name: string): Promise<string> {
        const element: ElementFinder = await this.nativeElement();

        return element.getAttribute(name);
    }

    async text(): Promise<string> {
        const element: ElementFinder = await this.nativeElement();

        return element.getText();
    }

    async value(): Promise<string> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return promised(webElement.getDriver().executeScript(
            /* istanbul ignore next */
            function getValue(webElement) {
                return webElement.value;
            },
            webElement,
        ));
    }

    async isActive(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();
        const webElement: WebElement = await element.getWebElement();

        return webElement.getDriver().switchTo().activeElement().then((active: WebElement) =>
            element.equals(active),
        );
    }

    async isClickable(): Promise<boolean> {
        return this.isEnabled();
    }

    async isEnabled(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return element.isEnabled();
    }

    async isPresent(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return element.isPresent();
    }

    async isSelected(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        return element.isSelected();
    }

    async isVisible(): Promise<boolean> {
        const element: ElementFinder = await this.nativeElement();

        if (! await element.isDisplayed()) {
            return false;
        }

        const webElement: WebElement = await element.getWebElement();

        // get element at cx/cy and see if the element we found is our element, and therefore it's visible.
        return promised(webElement.getDriver().executeScript(
            `
            var element = arguments[0];
            
            if (!element.getBoundingClientRect || !element.scrollIntoView || !element.contains || !element.getClientRects || !document.elementFromPoint) {
                return false
            }

            // Edge before switching to Chromium
            const isOldEdge = !!window['StyleMedia']
            // returns true for Chrome and Firefox and false for Safari, Edge and IE
            const scrollIntoViewFullSupport = !(window.safari || isOldEdge)

            // get overlapping element
            function getOverlappingElement (elem, context) {
                context = context || document
                const elemDimension = elem.getBoundingClientRect()
                const x = elemDimension.left + (elem.clientWidth / 2)
                const y = elemDimension.top + (elem.clientHeight / 2)
                return context.elementFromPoint(x, y)
            }

            // get overlapping element rects (currently only the first)
            // applicable if element's text is multiline.
            function getOverlappingRects (elem, context) {
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
            function getOverlappingElements (elem, context) {
                return [getOverlappingElement(elem, context)].concat(getOverlappingRects(elem, context))
            }

            // is a node a descendant of a given node
            function nodeContains (elem, otherNode) {
                // Edge doesn't support neither Shadow Dom nor contains if ShadowRoot polyfill is used
                if (isOldEdge) {
                    let tmpElement = otherNode
                    while (tmpElement) {
                        if (tmpElement === elem) {
                            return true
                        }

                        tmpElement = tmpElement.parentNode
                        // DocumentFragment / ShadowRoot polyfill like ShadyRoot
                        if (tmpElement && tmpElement.nodeType === 11 && tmpElement.host) {
                            tmpElement = tmpElement.host
                        }
                    }
                    return false
                }

                return elem.contains(otherNode)
            }

            // is one of overlapping elements the \`elem\` or one of its child
            function isOverlappingElementMatch (elementsFromPoint, elem) {
                if (elementsFromPoint.some(function (elementFromPoint) {
                    return elementFromPoint === elem || nodeContains(elem, elementFromPoint)
                })) {
                    return true
                }

                // shadow root
                // filter unique elements with shadowRoot
                // @ts-ignore
                let elemsWithShadowRoot = [].concat(elementsFromPoint)
                elemsWithShadowRoot = elemsWithShadowRoot.filter(function (x) {
                    return x && x.shadowRoot && x.shadowRoot.elementFromPoint
                })

                // getOverlappingElements of every element with shadowRoot
                let shadowElementsFromPoint = []
                for (let i = 0; i < elemsWithShadowRoot.length; ++i) {
                    let shadowElement = elemsWithShadowRoot[i]
                    shadowElementsFromPoint = shadowElementsFromPoint.concat(
                        getOverlappingElements(elem, shadowElement.shadowRoot)
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

            function isElementInViewport (elem) {
                if (!elem.getBoundingClientRect) {
                    return false
                }
        
                const rect = elem.getBoundingClientRect()
        
                const windowHeight = (window.innerHeight || document.documentElement.clientHeight)
                const windowWidth = (window.innerWidth || document.documentElement.clientWidth)
        
                const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) > 0)
                const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) > 0)
        
                return (vertInView && horInView)
            }

            return isElementInViewport(element) && isOverlappingElementMatch(getOverlappingElements(element), element);
            `,
            webElement,
        ));
    }
}
