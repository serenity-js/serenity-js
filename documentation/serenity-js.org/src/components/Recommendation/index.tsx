import Link from '@docusaurus/Link';
import Image, { SrcImage } from '@theme/IdealImage';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

export interface Props {
    author: {
        name: string;
        title: string;
        avatar: { default: string } | { src: SrcImage; preSrc: string } | string;
    },
    lines: string[],
    learnMore: {
        path: string;
        text: string;
    }
}

export default function Recommendation(recommendation: Props): React.JSX.Element {
    return (
        <div className={ clsx('card', styles.recommendation) }>
            <div className="card__header">
                <div className="avatar">
                    <Image img={ recommendation.author.avatar } alt={ recommendation.author.name }
                        className="avatar__photo avatar__photo--xl"
                        width="48"
                        height="48"
                        loading="lazy"
                    />
                    <div className={ clsx('avatar__intro') }>
                        <strong className="avatar__name">{ recommendation.author.name }</strong>
                        <span>{  recommendation.author.title }</span>
                    </div>
                </div>
            </div>

            <div className={ clsx('card__body', styles.recommendation) }>
                { recommendation.lines.map(line => (
                    <p className="padding-horiz--md">
                        { line }
                    </p>
                )) }
                <p className="padding-horiz--md">
                    <Link className={ clsx(styles.recommendationMeta) } to={ recommendation.learnMore.path }>
                        { recommendation.learnMore.text }
                    </Link>
                </p>
            </div>
        </div>
    );
}
