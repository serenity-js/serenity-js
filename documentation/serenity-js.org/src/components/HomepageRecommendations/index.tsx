import Translate from '@docusaurus/Translate';
import { LeaderRecommendations } from '@site/src/components/HomepageRecommendations/data/recommendations';
import Recommendation from '@site/src/components/Recommendation';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';
import styles from './index.module.css';

export interface SectionProps {
    className?: string;
}

export function LeaderRecommendationsSection({ className }: SectionProps) {

    const columns = LeaderRecommendations.reduce((acc, recommendation, i) => {
        acc[i % 2].push(recommendation);
        return acc;
    }, [[], []]);

    return (
        <section className={ className }>
            <div className="container">
                <Heading as="h2" className={ clsx('margin-bottom--lg', 'text--center') }>
                    <Translate>Recommended by Open-Source Leaders</Translate>
                </Heading>
                <div className={ clsx('row', styles.recommendationsRow) }>
                    { columns.map((recommendationItems, i) => (
                        <div className="col col--6" key={ i }>
                            { recommendationItems.map((recommendation) => (
                                <Recommendation { ...recommendation } key={recommendation.author.name} />
                            )) }
                        </div>
                    )) }
                </div>
            </div>
        </section>
    );
}
