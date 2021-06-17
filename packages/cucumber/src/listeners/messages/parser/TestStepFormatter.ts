import { PickleDocString, PickleTable } from '@cucumber/messages';
import Table = require('cli-table3');

/**
 * @package
 */
export class TestStepFormatter {

    public format(keyword: string, text = '', argument?: {
        docString?: PickleDocString,
        dataTable?: PickleTable,
    }): string {
        return [
            keyword,
            text,
            argument && this.formatStepArgument(argument),
        ].join('').trim();
    }

    private formatStepArgument(argument: {
        docString?: PickleDocString,
        dataTable?: PickleTable,
    }): string {

        if (argument.docString) {
            return this.formatDocString(argument.docString);
        }

        if (argument.dataTable) {
            return this.formatDataTable(argument.dataTable);
        }

        return '';
    }

    private formatDocString(docString: PickleDocString): string {
        return `\n${ docString.content }`;
    }

    private formatDataTable(dataTable: PickleTable): string {
        const table = new Table({
            chars: {
                bottom: '',
                'bottom-left': '',
                'bottom-mid': '',
                'bottom-right': '',
                left: '|',
                'left-mid': '',
                mid: '',
                'mid-mid': '',
                middle: '|',
                right: '|',
                'right-mid': '',
                top: '',
                'top-left': '',
                'top-mid': '',
                'top-right': '',
            },
            style: {
                border: [],
                'padding-left': 1,
                'padding-right': 1,
            },
        });

        const rows = dataTable.rows.map(row =>
            row.cells.map(cell =>
                cell.value.replace(/\\\\/g, '\\\\\\\\').replace(/\\n/g, '\\\\n')
            )
        );

        table.push(...rows);

        return `\n${ table.toString() }`;
    }
}
