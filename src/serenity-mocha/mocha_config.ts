export interface MochaConfig {

    /**
     * @default 'bdd'
     */
    ui?: 'bdd' | 'exports' | 'qunit' | 'tdd';

    /**
     * Console reporter type.
     * @default 'spec'
     */
    reporter?: 'doc' |
        'dot' |
        'html' |
        'json-stream' |
        'json' |
        'landing' |
        'list' |
        'markdown' |
        'min' |
        'nyan' |
        'progress' |
        'spec' |
        'tap' |
        'xunit';

    /**
     * Register a custom compiler, such as 'ts:ts-node/register'
     */
    compiler?: string;

    /**
     * Timeout in milliseconds
     */
    timeout?: number;

    /**
     * String or regexp to filter tests with
     */
    grep?: string | RegExp;

    /**
     * Number of times to retry failed tests
     */
    retries?: number;

    /**
     * Bail on the first test failure
     */
    bail?: boolean;

    /**
     * Milliseconds to wait before considering a test slow
     */
    slow?: number;

    /**
     * Ignore global leaks
     */
    ignoreLeaks?: boolean;

    /**
     * Display the full stack-trace on failing
     */
    fullTrace?: boolean;
}
