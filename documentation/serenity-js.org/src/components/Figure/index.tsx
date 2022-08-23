import React from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'

export interface FigureProps {
    imgSrc: string;
    caption: string;
    externalLink: string;
}

export default function Figure({ imgSrc, caption, externalLink = undefined }: FigureProps) {


    const figcaption = externalLink
        ? <figcaption>{caption} (<a href={ externalLink } target="_blank" rel="noopener noreferrer">source</a>)</figcaption>
        : <figcaption>{caption}</figcaption>;

    return (
        <figure>
            <img src={useBaseUrl(imgSrc)} alt={caption} />
            {figcaption}
        </figure>
    )
}
