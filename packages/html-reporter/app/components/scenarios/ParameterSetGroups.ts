import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportParameterSet } from '../../../src/cli/ReportData';
import { ParameterSetGroup } from './ParameterSetGroup';
import { ParameterSetNode } from './ParameterSetNode';

const html = htm.bind(h);

export interface ParameterSetGroupsProps {
    parameters: ReportParameterSet[];
}

export function ParameterSetGroups({ parameters }: ParameterSetGroupsProps): ReturnType<typeof html> {
    const groups = useMemo(() => {
        const result: Array<{ key: string; name: string | undefined; description: string | undefined; items: ReportParameterSet[] }> = [];
        let current: { key: string; name: string | undefined; description: string | undefined; items: ReportParameterSet[] } | null = null;
        for (const ps of parameters) {
            const key = (ps.name || '') + '\0' + (ps.description || '');
            if (!current || current.key !== key) {
                current = { key, name: ps.name, description: ps.description, items: [] };
                result.push(current);
            }
            current.items.push(ps);
        }
        return result;
    }, [parameters]);

    if (groups.length === 1 && !groups[0].name && !groups[0].description) {
        return html`${groups[0].items.map((ps, index) => html`<${ParameterSetNode} ps=${ps} index=${index} groupIndex=${0} forceExpanded=${undefined} />`)}`;
    }

    return html`${groups.map((group, index) => html`<${ParameterSetGroup} group=${group} index=${index} />`)}`;
}
