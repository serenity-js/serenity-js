import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import {
    actorCalled,
    Cast,
    configure,
    engage,
    Log,
    Notepad,
    notes,
    q,
    TakeNotes,
    TestCompromisedError
} from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import { AxiosError } from 'axios';
import * as http from 'http';
import { afterEach, before, describe, it } from 'mocha';
import { createProxy, ProxyServer } from 'proxy';

function server(request, response) {

    const headersReceived = [];

    if (request.headers['proxy-connection']) {
        headersReceived.push('proxy-connection')
    }

    if (request.headers['proxy-authorization']) {

        const [ scheme, credentials ] = request.headers['proxy-authorization'].split(' ');

        const decoded = Buffer.from(credentials, 'base64').toString('utf8');

        headersReceived.push(`proxy-authorization: ${ scheme } ${ decoded }`)
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        headersReceived
    }));
}

interface LocalServers {
    proxyPort: number;
    serverUrl: string;
}

describe('@serenity-js/rest', function () {

    this.timeout(30_000);

    let notepad: Notepad<LocalServers>;

    describe('CallAnApi', () => {

        let proxy: ProxyServer;
        let envProxy: string;

        before(async () => {
            configure({
                crew: [
                    '@serenity-js/console-reporter',
                ],
            });
        });

        beforeEach(async () => {
            envProxy = process.env.HTTP_PROXY;

            notepad = Notepad.empty();

            proxy = createProxy(http.createServer());

            engage(Cast.where(actor => ({
                Proxima: actor.whoCan(
                    ManageALocalServer.runningAHttpListener(proxy),
                    TakeNotes.using(notepad),
                ),
                Serverin: actor.whoCan(
                    ManageALocalServer.runningAHttpListener(server),
                    TakeNotes.using(notepad),
                ),
            }[actor.name] || actor.whoCan(TakeNotes.using(notepad)))))

            await actorCalled('Serverin').attemptsTo(
                StartLocalServer.onRandomPort(),
                notes<LocalServers>().set('serverUrl', LocalServer.url()),
                Log.the(q`Server available at ${ notes<LocalServers>().get('serverUrl') }`)
            );

            await actorCalled('Proxima').attemptsTo(
                StartLocalServer.onRandomPort(),
                notes<LocalServers>().set('proxyPort', LocalServer.port()),
                Log.the(q`Proxy started on port ${ notes<LocalServers>().get('proxyPort') }`)
            );
        });

        afterEach(async () => {
            process.env.HTTP_PROXY = envProxy;

            await actorCalled('Serverin').attemptsTo(StopLocalServer.ifRunning());
            await actorCalled('Proxima').attemptsTo(StopLocalServer.ifRunning());
        });

        it('supports proxy configuration overriding', async () => {

            const proxyPort: number = await actorCalled('Proxima').answer(
                notes<LocalServers>().get('proxyPort')
            );

            await actorCalled('Apisitt').whoCan(
                CallAnApi.using({
                    proxy: {
                        protocol: 'http',
                        host: '127.0.0.1',
                        port: proxyPort,
                    }
                })
            ).
            attemptsTo(
                Send.a(GetRequest.to(notes<LocalServers>().get('serverUrl'))),
                Ensure.that(LastResponse.body(), equals({
                    headersReceived: ['proxy-connection']
                }))
            );
        });

        it('supports proxy environment variables', async () => {

            const proxyPort: number = await actorCalled('Proxima').answer(
                notes<LocalServers>().get('proxyPort')
            );

            process.env.HTTP_PROXY = `http://127.0.0.1:${ proxyPort }`;

            await actorCalled('Apisitt').whoCan(
                CallAnApi.at('http://127.0.0.1')    // dummy URL as it must be set synchronously
            ).
            attemptsTo(
                Send.a(GetRequest.to(notes<LocalServers>().get('serverUrl'))),
                Ensure.that(LastResponse.body(), equals({
                    headersReceived: ['proxy-connection']
                }))
            );
        });

        describe('authentication', () => {

            const expectedCredentials = {
                username: 'apisitt@example.org',
                password: 'P@ssword1',
            };

            it('supports proxy authentication overrides', async () => {

                const proxyPort: number = await actorCalled('Proxima').answer(
                    notes<LocalServers>().get('proxyPort')
                );

                await actorCalled('Apisitt').whoCan(
                    CallAnApi.using({
                        proxy: {
                            protocol: 'http',
                            host: '127.0.0.1',
                            port: proxyPort,
                            auth: {
                                username: expectedCredentials.username,
                                password: expectedCredentials.password,
                            }
                        }
                    })

                ).
                attemptsTo(
                    Send.a(GetRequest.to(notes<LocalServers>().get('serverUrl'))),
                    Ensure.that(LastResponse.body(), equals({
                        headersReceived: [
                            'proxy-connection',
                            `proxy-authorization: Basic ${expectedCredentials.username}:${expectedCredentials.password}`,
                        ]
                    }))
                );
            });

            it('supports proxy authentication specified using environment variables', async () => {

                const proxyPort: number = await actorCalled('Proxima').answer(
                    notes<LocalServers>().get('proxyPort')
                );

                process.env.HTTP_PROXY = `http://apisitt%40example.org:P%40ssword1@127.0.0.1:${ proxyPort }`;

                await actorCalled('Apisitt').whoCan(
                    CallAnApi.at('http://127.0.0.1')    // dummy URL as it must be set synchronously
                ).
                attemptsTo(
                    Send.a(GetRequest.to(notes<LocalServers>().get('serverUrl'))),
                    Ensure.that(LastResponse.body(), equals({
                        headersReceived: [
                            'proxy-connection',
                            `proxy-authorization: Basic ${expectedCredentials.username}:${expectedCredentials.password}`,
                        ]
                    }))
                );
            });
        });

        it('complains if the proxy protocol is not supported', async () => {

            const serverUrl: string = await actorCalled('Serverin').answer(
                notes<LocalServers>().get('serverUrl')
            );

            process.env.HTTP_PROXY = `invalid://127.0.0.1`;

            await expect(
                actorCalled('Apisitt').whoCan(
                    CallAnApi.at('http://127.0.0.1')    // dummy URL as it must be set synchronously
                ).
                attemptsTo(
                    Send.a(GetRequest.to(notes<LocalServers>().get('serverUrl'))),
                )
            ).
            to.be.rejectedWith(TestCompromisedError, `The API call has failed: GET ${ serverUrl }`).
            then((error: TestCompromisedError) => {
                expect(error.cause).to.be.instanceOf(AxiosError);
                expect(error.cause.name).to.equal('ConfigurationError');
                expect(error.cause.message).to.equal(`Unsupported protocol for proxy URL: invalid://127.0.0.1`);
            });
        });
    });
});
