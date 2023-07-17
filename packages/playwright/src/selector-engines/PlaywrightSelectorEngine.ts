export interface PlaywrightSelectorEngine {
    query(root: Element, selector: string): HTMLElement;
    queryAll(root: Element, selector: string): Array<HTMLElement>;
}
