import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

interface ActivityDocStringProps {
    content: string;
}

export function ActivityDocString({ content }: ActivityDocStringProps): ReturnType<typeof html> {
    return html`
        <div class="ml-lg mt-xs mb-sm">
          <pre class="pre-block">${content}</pre>
        </div>
    `;
}
