import React from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

function HeroBanner() {
    const { siteConfig} = useDocusaurusContext();
    const description = siteConfig.customFields.description as string[];

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
                <p>{description}</p>
                <div className={ styles.indexCtas }>
                    <Link id="cta-start-automating" className="button button--primary" to="/handbook/web-testing/your-first-web-scenario">
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

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { description } = siteConfig.customFields as { description: string };
    return (
        <Layout title={ siteConfig.title } description={ description }>
            <HeroBanner/>
            <main>
                <HomepageFeatures/>
            </main>
        </Layout>
    );
}

// From 1-man bands and start-ups to large delivery teams at top-tier investment banks, Serenity/JS has you covered.
// Test any system, any interface, any browser
