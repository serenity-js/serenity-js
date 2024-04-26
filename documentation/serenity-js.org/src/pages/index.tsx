import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Layout from '@theme/Layout';
import React from 'react';

import styles from './index.module.css';
import { LeaderRecommendationsSection } from '@site/src/components/HomepageRecommendations';
import clsx from 'clsx';

function HeroBanner() {
    return (
        <div className={ styles.hero } data-theme="dark">
            <div className={ styles.heroInner }>
                <h1 className={ styles.heroProjectTagline }>
                    <img
                        alt={ translate({ message: 'Serenity/JS logo' }) }
                        className={ styles.heroLogo }
                        src={ useBaseUrl('/images/serenity-js-avatar.png') }
                        width="300"
                        height="300"
                    />
                    <span
                        className={ styles.heroTitleTextHtml }
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={ {
                            __html: translate({
                                id: 'homepage.hero.title',
                                message:
                                    `Enable <b>collaborative<br /> test automation</b><br /> at <b>any scale</b>!`,
                                description:
                                    'Home page hero title, can contain simple html tags',
                            }),
                        } }
                    />
                </h1>
                <p>
                    <strong>Serenity/JS</strong> is an innovative <strong>test automation framework</strong> designed to
                    help you
                    create <strong>high-quality, business-focused test scenarios</strong> that interact with <strong>any
                    interface of your system</strong> and
                    produce <strong>comprehensive test reports</strong> that <strong>build trust</strong> between
                    delivery teams and the business.
                </p>
                <div className={ styles.indexCtas }>
                    <Link id="cta-start-automating" className="button button--primary"
                          to="/handbook/web-testing/your-first-web-scenario">
                        <Translate>Start automating 🚀</Translate>
                    </Link>
                    <span className={ styles.indexCtasGitHubButtonWrapper }>
                        <iframe
                            className={ styles.indexCtasGitHubButton }
                            src="https://ghbtns.com/github-btn.html?user=serenity-js&amp;repo=serenity-js&amp;type=star&amp;count=true&amp;size=large"
                            width={ 160 }
                            height={ 30 }
                            title="GitHub Stars"
                        />
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Home(): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { description } = siteConfig.customFields as { description: string };
    return (
        <Layout title={ siteConfig.title } description={ description }>
            <HeroBanner/>
            <main>
                <HomepageFeatures/>
                <LeaderRecommendationsSection className={clsx(styles.section, styles.sectionAlt)}/>
            </main>
        </Layout>
    );
}

