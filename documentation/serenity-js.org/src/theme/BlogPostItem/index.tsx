import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { useBlogPost } from '@docusaurus/theme-common/internal';
import Giscus from '@giscus/react';
import BlogPostItem from '@theme-original/BlogPostItem';

export default function BlogPostItemWithComments(props) {

    const { colorMode } = useColorMode();
    const { isBlogPostPage } = useBlogPost();

    return (
        <>
            <BlogPostItem {...props} />
            { isBlogPostPage && (
                <Giscus
                    id="giscus-comments"
                    repo="serenity-js/serenity-js"
                    repoId="MDEwOlJlcG9zaXRvcnk2MTMwODcxNA=="
                    category="Comments"
                    categoryId="DIC_kwDOA6d_Ks4CSdtl"
                    mapping="pathname"
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="top"
                    theme={colorMode}
                    lang="en"
                    strict="1"
                    loading="lazy"
                />
            )}
        </>
    );
}
