/* eslint-disable unicorn/no-for-loop,unicorn/consistent-function-scoping */
/* c8 ignore start */
export function isVisible(domNode: HTMLElement): boolean {

    const style = window.getComputedStyle(domNode);

    if (style.opacity === '0') {
        return false;
    }

    if (style.visibility === 'hidden') {
        return false;
    }

    if (style.display === 'none') {
        return false;
    }

    if (!domNode.getBoundingClientRect || !domNode.scrollIntoView || !domNode.contains || !domNode.getClientRects || !document.elementFromPoint) {
        return false
    }

    // Edge before switching to Chromium
    const isOldEdge = !!window['StyleMedia']

    // get overlapping element
    function getOverlappingElement (element: HTMLElement, context?: Document) {
        context = context || document
        const dimensions = element.getBoundingClientRect()
        const x = dimensions.left + (element.clientWidth / 2)
        const y = dimensions.top + (element.clientHeight / 2)
        return context.elementFromPoint(x, y)
    }

    // get overlapping element rects (currently only the first)
    // applicable if element's text is multiline.
    function getOverlappingRects (element: HTMLElement, context?: Document) {
        context = context || document
        const elements = []

        const rects = element.getClientRects()
        // webdriver clicks on center of the first element's rect (line of text), it might change in future
        const rect = rects[0]
        const x = rect.left + (rect.width / 2)
        const y = rect.top + (rect.height / 2)
        elements.push(context.elementFromPoint(x, y))

        return elements
    }

    // get overlapping elements
    function getOverlappingElements (element: HTMLElement, context?: Document) {
        return [getOverlappingElement(element, context)].concat(getOverlappingRects(element, context))
    }

    // is a node a descendant of a given node
    function nodeContains (element: HTMLElement, otherNode: HTMLElement) {
        // Edge doesn't support neither Shadow Dom nor contains if ShadowRoot polyfill is used
        if (isOldEdge) {
            let tempElement = otherNode as HTMLElement | ShadowRoot | Element
            while (tempElement) {
                if (tempElement === element) {
                    return true
                }

                tempElement = tempElement.parentNode as ShadowRoot
                // DocumentFragment / ShadowRoot polyfill like ShadyRoot
                if (tempElement && tempElement.nodeType === 11 && tempElement.host) {
                    tempElement = tempElement.host
                }
            }
            return false
        }

        return element.contains(otherNode)
    }

    // is one of overlapping elements the `elem` or one of its child
    function isOverlappingElementMatch (elementsFromPoint: HTMLElement[], element: HTMLElement): boolean {
        if (elementsFromPoint.some(function (elementFromPoint) {
            return elementFromPoint === element || nodeContains(element, elementFromPoint)
        })) {
            return true
        }

        // shadow root
        // filter unique elements with shadowRoot
        const elementsWithShadowRoot = [].concat(elementsFromPoint).filter(function (x: HTMLElement) {
            return x && x.shadowRoot && x.shadowRoot.elementFromPoint
        })

        // getOverlappingElements of every element with shadowRoot
        let shadowElementsFromPoint: HTMLElement[] = []
        for (let i = 0; i < elementsWithShadowRoot.length; ++i) {
            const shadowElement = elementsWithShadowRoot[i]
            shadowElementsFromPoint = shadowElementsFromPoint.concat(
                getOverlappingElements(element, (shadowElement as HTMLElement).shadowRoot as any) as any
            )
        }
        // remove duplicates and parents
        shadowElementsFromPoint = [].concat(shadowElementsFromPoint).filter(function (x) {
            return !elementsFromPoint.includes(x)
        })

        if (shadowElementsFromPoint.length === 0) {
            return false
        }

        return isOverlappingElementMatch(shadowElementsFromPoint, element)
    }

    return isOverlappingElementMatch(getOverlappingElements(domNode) as any as HTMLElement[], domNode)
}
/* c8 ignore stop */
