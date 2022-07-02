export abstract class RootLocator<Native_Element_Type> {
    public abstract switchToFrame(element: Native_Element_Type): Promise<void>;
    public abstract switchToParentFrame(): Promise<void>;
    public abstract switchToMainFrame(): Promise<void>;

    public abstract nativeElement(): Promise<Partial<Native_Element_Type>>;

    toString(): string {
        return 'root locator';
    }
}
