import htm from 'htm';
import { h } from 'preact';

import { targetValue } from '../../utils/index.js';

const html = htm.bind(h);

interface SearchInputProps {
    value: string;
    onInput: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
}

export function SearchInput({ value, onInput, placeholder, ariaLabel }: SearchInputProps): ReturnType<typeof html> {
    const resolvedPlaceholder = placeholder || 'Find test scenarios...';
    const resolvedAriaLabel = ariaLabel || resolvedPlaceholder.replace(/\.{3}$/, '');

    return html`
        <div style="position:relative" class="mb-md" data-testid="search-input">
            <input class="search-input" type="text" placeholder=${resolvedPlaceholder}
                value=${value} onInput=${(e: Event) => onInput(targetValue(e))}
                aria-label=${resolvedAriaLabel} />
            ${value ? html`<button onClick=${() => onInput('')}
                class="btn-clear"
                aria-label="Clear search">✕</button>` : null}
        </div>
    `;
}
