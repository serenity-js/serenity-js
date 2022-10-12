import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: JSX.Element;
};

const TopFeatures: FeatureItem[][] = [
    [
        {
            title: 'Make your tests speak your language',
            // Svg: require('@site/static/images/undraw_docusaurus_mountain.svg').default,
            Svg: require('@site/static/images/serenity-js-engineering-team.svg').default,
            description: (
                <>
                    Serenity/JS Screenplay Pattern helps you create automated tests and test <abbr title={ 'Domain-Specific Languages' }>DSLs</abbr> that capture the concepts and
                    vocabulary of your domain, focus on your business workflows, and bring your team together.
                </>
            ),
        },
        {
            title: 'Any browser, any device, any interface',
            Svg: require('@site/static/images/serenity-js-browsers-mobile-apis.svg').default,
            description: (
                <>
                    Serenity/JS is a modular and extensible abstraction layer
                    that works seamlessly with integration tools like
                    Playwright, Selenium, WebdriverIO, Appium, or Axios,
                    and gives you a consistent, intuitive, and vendor-agnostic API to work with.
                </>
            ),
        },
        {
            title: 'Run anytime, anywhere, in any context',
            Svg: require('@site/static/images/serenity-js-run-anywhere.svg').default,
            description: (
                <>
                    Serenity/JS integrates with popular test runners like Cucumber, Jasmine, Mocha, and Playwright Test,
                    and works just as well on your machine as it does
                    on your <abbr title={ 'Continuous Integration and Delivery' }>CI/CD</abbr> servers,
                    or deployed as part of your continuous monitoring infrastructure.
                </>
            ),
        },
    ],
    [
        {
            title: 'Share code across projects and teams',
            Svg: require('@site/static/images/serenity-js-share-code.svg').default,
            description: (
                <>
                    Serenity/JS is the first test automation framework designed to make sharing and reusing test code
                    easy not just across test suites, but also across projects and teams. Help your whole organisation benefit from your test automation work!
                </>
            ),
        },
        {
            title: 'Use with your favourite IDE and VCS',
            Svg: require('@site/static/images/serenity-js-ide.svg').default,
            description: (
                <>
                    Serenity/JS supports writing, running and debugging your tests in
                    popular <abbr title={ 'Integrated Development Environments' }>IDEs</abbr> like JetBrains and VS Code.
                    Serenity/JS tests are high-quality, standards-based Node.js code,
                    so you can commit them to Git to support trunk-based, multi-branch, and pull request-based development workflows.
                </>
            ),
        },
        {
            title: 'Report what really matters',
            Svg: require('@site/static/images/serenity-js-reporting.svg').default,
            description: (
                <>
                    Serenity/JS integrates with Serenity BDD to provide powerful living documentation and test reporting that gives meaningful feedback to testers,
                    business folks, and the team as a whole. Serenity/JS tells you not only what tests have been executed, but more importantly, what requirements have been tested.
                </>
            ),
        },
    ]
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={ clsx('col col--4') }>
            <div className="text--center">
                <Svg className={ styles.featureSvg } role="img"/>
            </div>
            <div className="padding-horiz--md">
                <h3>{ title }</h3>
                <p>{ description }</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={ styles.features }>
            <div className="container">
                { TopFeatures.map((row, rowId) => (
                    <div className="row" key={rowId}>
                        { row.map((feature, featureId) =>
                                <Feature key={ featureId } { ...feature } />
                        ) }
                    </div>
                )) }
            </div>
        </section>
    );
}
