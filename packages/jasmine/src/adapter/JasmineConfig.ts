// todo: document based on https://jasmine.github.io/setup/nodejs.html ?
export interface JasmineConfig {
    helpers?: string[];
    requires?: string[];
    random?: boolean;
    grep?: string;
    seed?: string;
    defaultTimeoutInterval?: number;
}
