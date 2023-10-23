import type { EventEmitter } from 'events';

/**
 * @private
 */
export interface CucumberFormatterOptions {
    cleanup: () => Promise<any>;
    colorFns: any;
    cwd: any;
    eventDataCollector: any;
    eventBroadcaster: EventEmitter;
    log: typeof process.stdout.write;
    snippetBuilder: any;
    stream: any;
    supportCodeLibrary: any;
    formatterHelpers: any;
}
