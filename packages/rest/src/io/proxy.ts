import type * as http from 'node:http';
import * as process from 'node:process';

import { ensure, isDefined } from 'tiny-types';

import type { AxiosRequestConfigDefaults, AxiosRequestConfigProxyDefaults } from './AxiosRequestConfigDefaults';
import { createUrl } from './createUrl';
import { EnvironmentVariables } from './EnvironmentVariables';
import { ProxyAgent } from './ProxyAgent';
import { ProxyBypass } from './ProxyBypass';

/**
 * @param options
 */
export function axiosProxyOverridesFor<Data = any>(options: AxiosRequestConfigDefaults<Data>): {
    proxy: false, httpAgent: http.Agent, httpsAgent: http.Agent
} {
    const agent = new ProxyAgent({
        httpAgent: options.httpAgent,
        httpsAgent: options.httpsAgent,

        // if there's a specific proxy override configured, use it
        // if not - detect proxy automatically based on the env variables
        getProxyForUrl: options.proxy
            ? createGetProxyForUrlFromConfig(options.proxy)
            : createGetProxyForUrlFromEnvironmentVariables(new EnvironmentVariables(process.env)),
    });

    return {
        proxy: false,
        httpAgent: agent,
        httpsAgent: agent,
    };
}

export function createGetProxyForUrlFromConfig(proxyOptions: AxiosRequestConfigProxyDefaults): (url: string) => string | undefined {
    const proxyBypass = ProxyBypass.create(proxyOptions?.bypass);

    return createGetProxyForUrl(proxyBypass, (url: URL): string => {
        return createUrl({
            username: proxyOptions.auth?.username,
            password: proxyOptions.auth?.password,
            protocol: proxyOptions.protocol,
            hostname: ensure('proxy.host', proxyOptions?.host, isDefined()),
            port: proxyOptions.port ? Number(proxyOptions.port) : undefined,
        }).toString();
    });
}

export function createGetProxyForUrlFromEnvironmentVariables(env: EnvironmentVariables): (url: string) => string | undefined {
    const proxyBypass = ProxyBypass.create(env.findFirst(
        'npm_config_no_proxy',
        'no_proxy',
    ));

    return createGetProxyForUrl(proxyBypass, (url: URL): string => {
        const protocolName = url.protocol.replace(/:$/, '');
        const proxyUrl = env.findFirst(
            `npm_config_${ protocolName }_proxy`,
            `${ protocolName }_proxy`,
            'npm_config_proxy',
            'all_proxy'
        );

        return proxyUrl || undefined;
    });
}

function createGetProxyForUrl(bypass: ProxyBypass, getProxy: (url: URL) => string): (url: string) => string | undefined {
    return function getProxyForUrl(urlValue: string): string | undefined {
        if (! isValidUrl(urlValue)) {
            return undefined;
        }

        const url = new URL(urlValue);

        return bypass.matches(url)
            ? undefined
            : getProxy(url);
    };
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

