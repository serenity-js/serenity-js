import { LogicError, Question } from '@serenity-js/core';
import { ManageALocalServer } from '../abilities';

import { AddressInfo } from 'net';

export class LocalServer {

    /**
     * @returns {Question<string>} Url of the locally running Node.js server
     */
    static url() {
        return Question.about<string>('the URL of the local server', actor => {
            return ManageALocalServer.as(actor).mapInstance((server, protocol) => {
                const info = server.address();

                if (! info) {
                    throw new LogicError(`The server has not been started yet`);
                }

                if (! isAddressInfo(info)) {
                    throw new LogicError(`A pipe or UNIX domain socket server does not have a URL`);
                }

                return [
                    protocol,
                    '://',
                    `${ info.family }`.toLowerCase() === 'ipv6' ? `[${ info.address }]` : info.address,
                    ':',
                    info.port,
                ].join('');
            });
        });
    }
}

/**
 * @param maybeAddressInfo
 * @private
 */
function isAddressInfo(maybeAddressInfo: AddressInfo | string): maybeAddressInfo is AddressInfo {
    return typeof maybeAddressInfo !== 'string'
        && !! maybeAddressInfo.address
        && !! maybeAddressInfo.family
        && !! maybeAddressInfo.port;
}
