/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { type ReactNode } from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

interface BrowserWindowProps {
    children: ReactNode;
    minHeight: number;
    backgroundColor: string;
    url: string;
}

export default function BrowserWindow({ children, minHeight, backgroundColor = 'none', url = 'http://localhost:3000' }: BrowserWindowProps): JSX.Element {
    return (
        <div className={ styles.browserWindow } style={ { minHeight } }>
            <div className={ styles.browserWindowHeader }>
                <div className={ styles.buttons }>
                    <span className={ styles.dot } style={ { background: '#f25f58' } }/>
                    <span className={ styles.dot } style={ { background: '#fbbe3c' } }/>
                    <span className={ styles.dot } style={ { background: '#58cb42' } }/>
                </div>
                <div className={ clsx(styles.browserWindowAddressBar, 'text--truncate') }>
                    { url }
                </div>
                <div className={ styles.browserWindowMenuIcon }>
                    <div>
                        <span className={ styles.bar }/>
                        <span className={ styles.bar }/>
                        <span className={ styles.bar }/>
                    </div>
                </div>
            </div>

            <div className={ styles.browserWindowBody } style={ { backgroundColor } }>{ children }</div>
        </div>
    );
}
