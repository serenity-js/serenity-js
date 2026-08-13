/**
 * Strips ANSI SGR escape sequences from a string, returning plain text.
 * Use this in list views where colour rendering is not appropriate.
 */
export function stripAnsi(text: string): string {
    if (!text || !text.includes('\u001b')) {
        return text || '';
    }
    return text.replace(/\u001b\[[0-9;]*m/g, '');
}

/**
 * Converts ANSI SGR escape sequences in a string to HTML spans with CSS classes.
 *
 * Supported codes:
 * - 0: reset all
 * - 1: bold
 * - 2: dim
 * - 22: normal intensity (end bold/dim)
 * - 30-37: standard foreground colours
 * - 39: default foreground (reset colour)
 * - 90-97: bright foreground colours
 *
 * Unsupported codes are silently stripped.
 */
export function ansiToHtml(text: string): string {
    if (!text || !text.includes('\u001b')) {
        return escapeHtml(text || '');
    }

    let result = '';
    const openSpans: string[] = [];

    const parts = text.split(/(\u001b\[[0-9;]*m)/);

    for (const part of parts) {
        const match = part.match(/^\u001b\[([0-9;]*)m$/);
        if (!match) {
            result += escapeHtml(part);
            continue;
        }

        const codes = match[1].split(';').map(Number);

        for (const code of codes) {
            result = handleSgrCode(code, openSpans, result);
        }
    }

    // Close any remaining open spans
    while (openSpans.length > 0) {
        result += '</span>';
        openSpans.pop();
    }

    return result;
}

const COLOUR_CLASSES: Record<number, string> = {
    30: 'ansi-black',
    31: 'ansi-red',
    32: 'ansi-green',
    33: 'ansi-yellow',
    34: 'ansi-blue',
    35: 'ansi-magenta',
    36: 'ansi-cyan',
    37: 'ansi-white',
    90: 'ansi-bright-black',
    91: 'ansi-bright-red',
    92: 'ansi-bright-green',
    93: 'ansi-bright-yellow',
    94: 'ansi-bright-blue',
    95: 'ansi-bright-magenta',
    96: 'ansi-bright-cyan',
    97: 'ansi-bright-white',
};

const COLOUR_NAMES = new Set([
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
    'bright-black', 'bright-red', 'bright-green', 'bright-yellow', 'bright-blue', 'bright-magenta', 'bright-cyan', 'bright-white',
]);

type SgrAction = (openSpans: string[], result: string) => string;

const SGR_ACTIONS: Record<number, SgrAction> = {
    1: (openSpans, result) => { openSpans.push('bold'); return result + '<span class="ansi-bold">'; },
    2: (openSpans, result) => { openSpans.push('dim'); return result + '<span class="ansi-dim">'; },
    22: (openSpans, result) => closeSpanAt(Math.max(openSpans.lastIndexOf('bold'), openSpans.lastIndexOf('dim')), openSpans, result),
    39: (openSpans, result) => closeSpanAt(findLastColourIndex(openSpans), openSpans, result),
};

function handleSgrCode(code: number, openSpans: string[], result: string): string {
    if (code === 0) {
        return closeAllSpans(openSpans, result);
    }

    const action = SGR_ACTIONS[code];
    if (action) {
        return action(openSpans, result);
    }

    const cls = COLOUR_CLASSES[code];
    if (cls) {
        openSpans.push(cls.replace('ansi-', ''));
        return result + `<span class="${cls}">`;
    }

    return result;
}

function closeAllSpans(openSpans: string[], result: string): string {
    while (openSpans.length > 0) {
        result += '</span>';
        openSpans.pop();
    }
    return result;
}

function closeSpanAt(targetIndex: number, openSpans: string[], result: string): string {
    if (targetIndex < 0) {
        return result;
    }

    // Close spans from the end down to (and including) the target, then reopen those above it
    const toReopen: string[] = [];
    while (openSpans.length > targetIndex + 1) {
        toReopen.unshift(openSpans.pop()!);
        result += '</span>';
    }
    openSpans.pop();
    result += '</span>';

    for (const cls of toReopen) {
        openSpans.push(cls);
        result += `<span class="ansi-${cls}">`;
    }

    return result;
}

function findLastColourIndex(spans: string[]): number {
    for (let i = spans.length - 1; i >= 0; i--) {
        if (COLOUR_NAMES.has(spans[i])) return i;
    }
    return -1;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
