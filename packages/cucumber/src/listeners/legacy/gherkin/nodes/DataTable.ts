import type { StepArgument } from './StepArgument.js';
import type { TableRow } from './TableRow.js';

/**
 * @private
 */
export interface DataTable extends StepArgument {
    type: 'DataTable';
    rows: TableRow[];
}
