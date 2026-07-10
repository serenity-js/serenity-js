import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

interface ActivityDataTableProps {
    headers: string[];
    rows: string[][];
}

export function ActivityDataTable({ headers, rows }: ActivityDataTableProps): ReturnType<typeof html> {
    return html`
        <div class="ml-lg mt-xs mb-sm overflow-x">
          <table class="data-table">
            <thead>
              <tr>${headers.map(header => html`<th>${header}</th>`)}</tr>
            </thead>
            <tbody>
              ${rows.map(row => html`
                <tr>${row.map(cell => html`<td>${cell}</td>`)}</tr>
              `)}
            </tbody>
          </table>
        </div>
    `;
}
