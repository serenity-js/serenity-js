import { ConfigurationError } from '@serenity-js/core';
import axios, { AxiosInstance, AxiosProxyConfig, AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as https from 'https';
import { URL } from 'url';

import { Credentials } from '../model';

const HttpsProxyAgent = require('https-proxy-agent');   // eslint-disable-line @typescript-eslint/no-var-requires

/**
 * @package
 */
export function axiosClient(
    repository: URL,
    ignoreSsl: boolean,
    env: { [key: string]: string },
    repositoryAuth?: Credentials
): AxiosInstance {

    const configuredProxy = isHttps(repository.protocol)
        ? firstNonEmpty(env, 'npm_config_https_proxy', 'https_proxy', 'HTTPS_PROXY')
        : firstNonEmpty(env, 'npm_config_proxy', 'npm_config_http_proxy', 'http_proxy', 'HTTP_PROXY');

    const configuredNoProxy = firstNonEmpty(env, 'npm_config_noproxy', 'no_proxy', 'NO_PROXY');

    const configuredCa = certificationAuthority(env);

    const rejectUnauthorized = shouldRejectUnauthorizedCertificates(env, ignoreSsl);

    const options: AxiosRequestConfig = {
        baseURL:    repository.toString(),
        adapter:    [ 'http' ],
        auth:       repositoryAuth,
    };

    if (isHttps(repository.protocol)) {
        options.proxy = false;
        options.httpsAgent = shouldProxy(repository, configuredProxy, configuredNoProxy)
            ? proxiedHttpsAgent(proxyConfigFrom(configuredProxy), configuredCa, rejectUnauthorized)
            : httpsAgent(configuredCa, rejectUnauthorized);
    }
    else {
        options.proxy = shouldProxy(repository, configuredProxy, configuredNoProxy)
            ? proxyConfigFrom(configuredProxy)
            : undefined;
    }

    if (env.npm_config_user_agent) {
        options.headers = { 'User-Agent': env.npm_config_user_agent };
    }

    return axios.create(options);
}

/**
 * @package
 */
export function shouldProxy(url: URL, configuredProxy: EnvVar, configuredNoProxy: EnvVar): boolean {
    // there's no proxy configured so don't proxy...
    if (! configuredProxy.value) {
        return false;
    }

    const noProxyDomains = (configuredNoProxy.value || '').split(',').map(_ => _.trim());

    return ! noProxyDomains.some(noProxyDomain => {
        if (! noProxyDomain) {
            return false;
        }

        if (noProxyDomain === '*') {
            return true;
        }

        if (noProxyDomain[0] === '.' && url.hostname.slice(url.hostname.length - noProxyDomain.length) === noProxyDomain) {
            return true;
        }

        return url.hostname === noProxyDomain;
    });
}

function proxyConfigFrom(proxyUrl: EnvVar): AxiosProxyConfig | undefined {

    if (! proxyUrl || ! proxyUrl.value) {
        return undefined;
    }

    let parsed: URL;

    try {
        parsed = new URL(proxyUrl.value);
    } catch (error) {
        throw new ConfigurationError(`Env variable ${ proxyUrl.name }=${ proxyUrl.value } should specify a valid URL`, error);
    }

    if (! isSupportedProtocol(parsed.protocol)) {
        throw new ConfigurationError(`Env variable ${ proxyUrl.name }=${ proxyUrl.value } should specify protocol to be used, i.e. http:// or https://`);
    }

    return {
        protocol: parsed.protocol,
        host: parsed.hostname,

        port: parsed.port
            ? Number.parseInt(parsed.port, 10)
            : (isHttps(parsed.protocol) ? 443 : 80),

        auth: (parsed.password || parsed.username) ? {
            password: parsed.password,
            username: parsed.username,
        } : undefined,
    };
}

function shouldRejectUnauthorizedCertificates(env: { [key: string]: string }, ignoreSsl: boolean): boolean {
    return ! ignoreSsl
        || env.npm_config_strict_ssl === 'true'
}

function proxiedHttpsAgent(proxyConfig: AxiosProxyConfig, ca: string, rejectUnauthorized: boolean) {
    return new HttpsProxyAgent({ ca, rejectUnauthorized, ...proxyConfig });
}

function httpsAgent(ca: string, rejectUnauthorized: boolean): https.Agent {
    return new https.Agent({ ca, rejectUnauthorized, });
}

function certificationAuthority(env: { [key: string]: string }): string | undefined {

    // old school, the value is specified in the env var itself
    if (env.npm_config_ca) {
        return env.npm_config_ca;
    }

    if (env.npm_config_cafile) {
        try {
            return fs.readFileSync(env.npm_config_cafile, { encoding: 'utf8' });
        } catch (error) {
            throw new ConfigurationError(`Could not read npm_config_cafile at ${ env.npm_config_cafile }`, error);
        }
    }

    return undefined;
}

type EnvVar = { name?: string, value?: string };    // eslint-disable-line unicorn/prevent-abbreviations

function firstNonEmpty(env: { [key: string]: string }, ...candidateVariables: string[]): EnvVar {
    const found = candidateVariables.find(value => !! env[value]);

    return found
        ? { name: found, value: env[found] }
        : {};
}

function isSupportedProtocol(protocol: string) {
    return [ 'http:', 'https:', 'socks4:', 'socks5:' ]
        .find(supported => supported === protocol);
}

function isHttps(urlOrProtocol: string) {
    return urlOrProtocol
        && urlOrProtocol.startsWith('https:');
}
