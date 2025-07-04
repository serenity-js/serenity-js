import { URL } from 'node:url';

import type { QuestionAdapter } from '@serenity-js/core';
import { LogicError, Question } from '@serenity-js/core';
import type { AddressInfo } from 'net';

import { ManageALocalServer } from '../abilities';

/**
 * @group Questions
 */
export class LocalServer {

    /**
     * Retrieves the URL of the local server started
     * using the [`StartLocalServer`](https://serenity-js.org/api/local-server/class/StartLocalServer/) [interaction](https://serenity-js.org/api/core/class/Interaction/).
     */
    static url(): QuestionAdapter<string> {
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

    /**
     * Retrieves the port number of the local server started
     * using the [`StartLocalServer`](https://serenity-js.org/api/local-server/class/StartLocalServer/) [interaction](https://serenity-js.org/api/core/class/Interaction/).
     */
    static port(): QuestionAdapter<number> {
        return Question.about(`local server port number`, async actor => {
            const url = await actor.answer(LocalServer.url());

            return Number.parseInt(new URL(url).port, 10);
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
