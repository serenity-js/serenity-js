import type { Reporters } from '@wdio/types';

/**
 * @package
 */
export interface InitialisesReporters {
    _loadReporter(reporter: Reporters.ReporterEntry): Promise<void>;
}
