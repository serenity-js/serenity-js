/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

function LinkedInLink() {
  return (
    <Link href="https://www.linkedin.com/company/serenity-js" className={styles.twitter}>
        <svg style={{
            position: 'relative',
            left: 4,
            top: 3,
            marginRight: 8,
        }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 72 72">
            <g fill="none" fill-rule="evenodd">
                <path
                    d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z"
                    fill="#007EBB"/>
                <path
                    d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z"
                    fill="#FFF"/>
            </g>
        </svg>
        <b>Serenity/JS</b>
    </Link>
  );
}

function RssLink() {
  return (
    <Link href="pathname:///changelog/rss.xml" className={styles.rss}>
      <svg
        style={{
          fill: '#f26522',
          position: 'relative',
          left: 4,
          top: 2,
          marginRight: 8,
        }}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24">
        <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z" />
      </svg>
      <b>
        <Translate id="changelog.description.rssLink">RSS feeds</Translate>
      </b>
    </Link>
  );
}

export default function ChangelogListHeader({
  blogTitle,
}: {
  blogTitle: string;
}): JSX.Element {
  return (
    <header className="margin-bottom--lg">
      <h1 style={{fontSize: '3rem'}}>{blogTitle}</h1>
      <p>
        <Translate
          id="changelog.description"
          values={{
            linkedInLink: <LinkedInLink />,
            rssLink: <RssLink />,
          }}>
          {
            'Subscribe to {rssLink} or follow {linkedInLink} on LinkedIn to stay up to date with new releases!'
          }
        </Translate>
      </p>
    </header>
  );
}
