export interface TestFrameworkAdapter {
    run(specs: string[]): PromiseLike<any>;
}
