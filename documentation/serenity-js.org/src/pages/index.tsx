import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={ clsx('hero hero--primary', styles.heroBanner) }>
            <div className="container">
                <h1 className="hero__title">{ siteConfig.title }</h1>
                <p className="hero__subtitle">{ siteConfig.tagline }</p>
                <div className={ styles.buttons }>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/intro">
                        Get Started in 5 min 🚀️
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={ siteConfig.title }
            description="Serenity/JS is an open-source collaborative test automation framework ideal for writing acceptance tests in complex business domains">
            <HomepageHeader/>
            <main>
                <HomepageFeatures/>
            </main>
        </Layout>
    );
}
