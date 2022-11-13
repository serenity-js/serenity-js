import React from 'react'
import Admonition from '@theme/Admonition'

export default function ArticleStubInfo() {

    return (
        <Admonition type={"info"} title={"Coming soon"}>
            <p>
                This article is coming soon! If you'd like us to prioritise writing it - give it a thumbs up in the reactions section below 👍
            </p>
            <p>
                Make sure to follow Serenity/JS on <a href="https://www.linkedin.com/company/serenity-js/" title="Follow Serenity/JS on LinkedIn">LinkedIn</a> or <a href={"https://twitter.com/SerenityJS"} title="Follow Serenity/JS on Twitter">Twitter</a> to get notified when new articles are available 🔔
            </p>
            <p>
                To help us secure more time to work on Serenity/JS documentation, please  <a href="https://github.com/sponsors/serenity-js" target="_blank" rel="noopener noreferrer">support our work on GitHub</a>.
            </p>
        </Admonition>
    )
}
