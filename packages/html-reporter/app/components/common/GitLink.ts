import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

interface GitLinkProps {
    icon: ReturnType<typeof html>;
    label: string;
    href?: string;
    mono?: boolean;
}

export function GitLink({ icon, label, href, mono }: GitLinkProps): ReturnType<typeof html> {
    const textClass = mono ? 'font-mono text-xs' : 'text-xs';
    return html`
        <span class="inline-flex-center">
            ${icon}${href
                ? html`<a href="${href}" target="_blank" onClick=${(e: Event) => e.stopPropagation()} class="${textClass}" style="color:inherit;text-decoration:none" onMouseOver=${(e: Event) => (e.target as HTMLElement).style.textDecoration='underline'} onMouseOut=${(e: Event) => (e.target as HTMLElement).style.textDecoration='none'}>${label}</a>`
                : html`<span class="${textClass}">${label}</span>`
            }
        </span>
    `;
}
