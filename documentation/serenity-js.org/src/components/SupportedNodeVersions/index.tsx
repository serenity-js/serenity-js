import React from 'react'

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function joined(items: string[], conjunction: string) {
    switch (items.length) {
        case 0:
            return '';
        case 1:
            return items[0];
        case 2:
            return `${ items[0] } ${ conjunction } ${ items[1] }`;
        default:
            const list      = items.slice(0, -1);
            const lastItem  = items.slice(-1);
            return list.join(', ') + `, ${ conjunction }`.trim() + ` ${ lastItem }`;
    }
}

export interface SupportedNodeVersionsProps {
    conjunction?: 'and' | 'or';
}

export default function SupportedNodeVersions({ conjunction = 'and' }: SupportedNodeVersionsProps) {

    const { siteConfig} = useDocusaurusContext();
    const supportedNodeEngines = siteConfig.customFields.supportedEngines['node'] as string;
    const nodeVersionNumbers: string[] = supportedNodeEngines.split('||').map(version => version.replace(/.*?([0-9]+).*?/, '$1').trim())

    return (
        <span>
            {joined(nodeVersionNumbers, conjunction)}
        </span>
    )
}
