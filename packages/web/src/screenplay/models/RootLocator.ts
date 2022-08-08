/**
 * {@link RootLocator} represents the context in which {@link Locator} looks for {@link PageElement} or {@link PageElements}.
 * This context is either a parent element, or some representation of the top-level browsing context.
 *
 * ## Learn more
 * - [[Locator]]
 * - [[Page.locate]]
 * - [[PageElement]]
 * - [[PageElements]]
 *
 * @group Models
 */
export abstract class RootLocator<Native_Element_Type> {
    public abstract switchToFrame(element: Native_Element_Type): Promise<void>;
    public abstract switchToParentFrame(): Promise<void>;
    public abstract switchToMainFrame(): Promise<void>;

    public abstract nativeElement(): Promise<Partial<Native_Element_Type>>;

    toString(): string {
        return 'root locator';
    }
}
