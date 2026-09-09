import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { SearchInput } from './SearchInput.js';

const html = htm.bind(h);

type Props = Parameters<typeof SearchInput>[0];

const noop = (): void => { /* no-op */ };

export const Default = ({ onInput = noop, ...props }: Props): ReturnType<typeof SearchInput> =>
    SearchInput({ onInput, ...props });

export function WithInput(props: Props): ReturnType<typeof html> {
    const [inputValue, setInputValue] = useState('');

    return html`
        <${SearchInput} ...${props} onInput=${(value: string) => setInputValue(value)} />
        <form hidden><input data-testid="input-value" readOnly value=${inputValue} /></form>
    `;
}
