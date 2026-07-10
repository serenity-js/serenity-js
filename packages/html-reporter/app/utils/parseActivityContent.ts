export interface ParsedActivityContent {
    displayName: string;
    parsedDataTable: { headers: string[]; rows: string[][] } | null;
    parsedDocString: string | null;
}

/**
 * Parses an activity name to extract embedded data tables (Cucumber-style `| col | val |` rows)
 * and doc strings (content after a colon-newline separator).
 */
export function parseActivityContent(name: string): ParsedActivityContent {
    const lines = name.split('\n');

    const dataTable = extractDataTable(lines);
    if (dataTable) {
        return dataTable;
    }

    const docString = extractDocString(name);
    if (docString) {
        return docString;
    }

    return { displayName: name, parsedDataTable: null, parsedDocString: null };
}

function extractDataTable(lines: string[]): ParsedActivityContent | null {
    const firstTableIndex = lines.findIndex(l => l.trim().startsWith('|'));
    if (firstTableIndex < 0 || (firstTableIndex === 0 && lines.length <= 1)) {
        return null;
    }

    const textLines: string[] = [];
    const tableLines: string[] = [];
    let inTable = false;

    for (const line of lines) {
        if (line.trim().startsWith('|')) {
            inTable = true;
            tableLines.push(line);
        } else if (!inTable) {
            textLines.push(line);
        } else {
            textLines.push(line);
            inTable = false;
        }
    }

    if (tableLines.length === 0) {
        return null;
    }

    const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const rows = tableLines.slice(1).map(row => row.split('|').filter(c => c.trim()).map(c => c.trim()));

    return {
        displayName: textLines.join('\n').replace(/:\s*$/, ':'),
        parsedDataTable: { headers, rows },
        parsedDocString: null,
    };
}

function extractDocString(name: string): ParsedActivityContent | null {
    const colonIndex = name.indexOf(':\n');
    if (colonIndex <= 0) {
        return null;
    }

    const afterColon = name.substring(colonIndex + 2);
    if (afterColon.trim().startsWith('|')) {
        return null;
    }

    return {
        displayName: name.substring(0, colonIndex + 1),
        parsedDataTable: null,
        parsedDocString: afterColon,
    };
}
