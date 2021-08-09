import { Reporters } from '@wdio/types';

/**
 * @package
 */
export interface InitialisesReporters {
    initReporter(reporter: Reporters.ReporterEntry): void;
}
