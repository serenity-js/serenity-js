/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import clsx from 'clsx';
import React from 'react';
import { useBlogPost } from '@docusaurus/theme-common/internal';
import ChangelogItemHeader from '@theme/ChangelogItem/Header';
import type { Props } from '@theme/BlogPostItem';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

import styles from './styles.module.css';

// apply a bottom margin in list view
function useContainerClassName() {
    const { isBlogPostPage } = useBlogPost();
    return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

export default function ChangelogItem({ children }: Props): JSX.Element {

    const containerClassName = useContainerClassName();

    return (
        <BlogPostItemContainer className={ clsx(containerClassName, styles.changelogItemContainer) }>
            <ChangelogItemHeader/>
            <BlogPostItemContent>{ children }</BlogPostItemContent>
            <BlogPostItemFooter/>
        </BlogPostItemContainer>
    );
}
