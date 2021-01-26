/* istanbul ignore file */

import { StepArgument } from './StepArgument';
import { TableRow } from './TableRow';

/**
 * @private
 */
export interface DataTable extends StepArgument {
    type: 'DocString';
    rows: TableRow[];
}
