import React from 'react'
import Image from '@theme/IdealImage';

import styles from './styles.module.css';

function differenceInYears(start: Date, end: Date) {
    const differenceInMilliseconds = Math.abs(end.getTime() - start.getTime());
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    return Math.floor(differenceInMilliseconds / millisecondsInYear);
}

const experience = differenceInYears(new Date('2006-03-01'), new Date());

export default function AuthorBio() {

    return (
        <footer className={ styles.authorBio }>
            <Image img={ require('@site/static/images/jan-molak.png') } width={ 200 } alt="Jan Molak"/>
            <div>
                <p>
                    <strong>Jan Molak</strong> is an independent software development consultant and trainer
                    helping teams around the world deliver software that matters.
                </p>
                <p>In his career spanning the last { experience } years,
                    Jan has worked on software ranging from best-selling,
                    award-winning <a href={'https://www.mobygames.com/person/292010/jan-molak/'} target={ '_blank' }>AAA video games</a> through
                    high-traffic websites and web apps to search engines, complex event processing and financial systems.
                </p>
                <p>
                    Jan is the author of the Serenity/JS acceptance testing framework,
                    co-author of <a href={ 'https://www.manning.com/books/bdd-in-action-second-edition' } target={ '_blank' }>"BDD in Action, Second Edition"</a>,
                    a contributor to the <a href={ '/handbook/design/screenplay-pattern/' }>Screenplay Pattern</a>,
                    and dozens of open-source tools in the Behaviour-Driven Development and test automation space.
                </p>
                <p>
                    Get in touch via <a href={ 'https://linkedin.com/in/janmolak' } target={ '_blank' }>LinkedIn</a> 💬
                </p>
            </div>
        </footer>
    )
}
