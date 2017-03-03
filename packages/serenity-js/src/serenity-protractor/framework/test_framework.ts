export interface TestFramework {
    run(specs: string[]): PromiseLike<any>;
}
