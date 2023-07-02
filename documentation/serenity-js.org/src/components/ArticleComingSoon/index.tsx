import React from 'react';
import Admonition from '@theme/Admonition';

export default function ArticleStubInfo() {

    return (
        <>
            <hr/>
            <Admonition type={ 'info' } title={ 'Coming soon' }>

                <p>
                    This article is coming soon! If you'd like me to prioritise writing it, give it a thumbs up 👍 in the reactions section below so that I know that this topic is in demand.
                    Also make sure to follow Serenity/JS on <a href="https://www.linkedin.com/company/serenity-js/" title="Follow Serenity/JS on LinkedIn">LinkedIn</a> or <a
                    href={ 'https://twitter.com/SerenityJS' } title="Follow Serenity/JS on Twitter">Twitter</a> to get notified 🔔 when new materials and releases are available.
                </p>
                <p>
                    And if you appreciate the amount of effort that goes into maintaining Serenity/JS and producing all the learning materials, please <a href="https://github.com/sponsors/serenity-js"
                                                                                                                                                          target="_blank" rel="noopener noreferrer">support
                    our work on GitHub</a>.
                </p>
            </Admonition>
        </>
    );
}
