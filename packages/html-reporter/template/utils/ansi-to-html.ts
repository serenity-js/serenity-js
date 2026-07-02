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

    let result = '';
    const openSpans: string[] = [];

    // Match ANSI escape sequences: ESC [ <codes> m
    const parts = text.split(/(\u001b\[[0-9;]*m)/);

    for (const part of parts) {
        const match = part.match(/^\u001b\[([0-9;]*)m$/);
        if (!match) {
            result += escapeHtml(part);
            continue;
        }

        const codes = match[1].split(';').map(Number);

        for (const code of codes) {
            if (code === 0) {
                // Reset all — close all open spans
                while (openSpans.length > 0) {
                    result += '</span>';
                    openSpans.pop();
                }
            } else if (code === 1) {
                openSpans.push('bold');
                result += '<span class="ansi-bold">';
            } else if (code === 2) {
                openSpans.push('dim');
                result += '<span class="ansi-dim">';
            } else if (code === 22) {
                // End bold/dim — close the most recent bold or dim span
                const lastBoldDim = openSpans.lastIndexOf('bold') >= openSpans.lastIndexOf('dim')
                    ? openSpans.lastIndexOf('bold')
                    : openSpans.lastIndexOf('dim');
                if (lastBoldDim >= 0) {
                    // Close spans from the end down to (and including) the target
                    const toReopen: string[] = [];
                    while (openSpans.length > lastBoldDim + 1) {
                        toReopen.unshift(openSpans.pop()!);
                        result += '</span>';
                    }
                    openSpans.pop();
                    result += '</span>';
                    // Re-open spans that were closed
                    for (const cls of toReopen) {
                        openSpans.push(cls);
                        result += `<span class="ansi-${cls}">`;
                    }
                }
            } else if (code === 39) {
                // Reset foreground — close the most recent colour span
                const lastColour = findLastColourIndex(openSpans);
                if (lastColour >= 0) {
                    const toReopen: string[] = [];
                    while (openSpans.length > lastColour + 1) {
                        toReopen.unshift(openSpans.pop()!);
                        result += '</span>';
                    }
                    openSpans.pop();
                    result += '</span>';
                    for (const cls of toReopen) {
                        openSpans.push(cls);
                        result += `<span class="ansi-${cls}">`;
                    }
                }
            } else if (COLOUR_CLASSES[code]) {
                const cls = COLOUR_CLASSES[code];
                openSpans.push(cls.replace('ansi-', ''));
                result += `<span class="${cls}">`;
            }
            // All other codes are silently ignored (stripped)
        }
    }

    // Close any remaining open spans
    while (openSpans.length > 0) {
        result += '</span>';
        openSpans.pop();
    }

    return result;
}

function findLastColourIndex(spans: string[]): number {
    const colourNames = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
        'bright-black', 'bright-red', 'bright-green', 'bright-yellow', 'bright-blue', 'bright-magenta', 'bright-cyan', 'bright-white'];
    for (let i = spans.length - 1; i >= 0; i--) {
        if (colourNames.includes(spans[i])) return i;
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
