import React from 'react'
import Admonition from '@theme/Admonition'

export default function ArticleStubInfo() {

    return (
        <Admonition type={"info"} title={"Coming soon"}>
            <p>
                This article is coming soon! If you'd like us to prioritise writing it - give it a thumbs up in the reactions section below 👍
            </p>
            <p>
                To help us secure more time to work on Serenity/JS documentation, please  <a href="https://github.com/sponsors/serenity-js" target="_blank" rel="noopener noreferrer">support our work on GitHub</a>.
            </p>
        </Admonition>
    )
}
