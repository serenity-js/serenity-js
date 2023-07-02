import React from 'react'

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function SupportedNodeVersions() {

    const { siteConfig} = useDocusaurusContext();
    const currentNodeVersion = (siteConfig.customFields.currentNodeVersion as string);

    return (
        <span>
            {currentNodeVersion}
        </span>
    )
}
