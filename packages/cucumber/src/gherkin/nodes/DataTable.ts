import { StepArgument } from './StepArgument';
import { TableRow } from './TableRow';

export interface DataTable extends StepArgument {
    type: 'DocString';
    rows: TableRow[];
}
