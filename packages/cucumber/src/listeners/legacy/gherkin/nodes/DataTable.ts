import type { StepArgument } from './StepArgument';
import type { TableRow } from './TableRow';

/**
 * @private
 */
export interface DataTable extends StepArgument {
    type: 'DataTable';
    rows: TableRow[];
}
