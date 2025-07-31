import type { URL } from 'node:url';

import { createUrl } from './createUrl';

export abstract class ProxyBypass {
    static create(value: string | undefined): ProxyBypass {
        if (value === undefined || value === '') {
            return new BypassNone();
        }

        if (value === '*') {
            return new BypassAll();
        }

        return new BypassMatching(value);
    }

    abstract matches(url: URL): boolean;
}

class BypassNone extends ProxyBypass {
    matches(url_: URL): boolean {
        return false;
    }
}

class BypassAll extends ProxyBypass {
    matches(url_: URL): boolean {
        return true;
    }
}

class BypassHostnamePattern extends ProxyBypass {
    private static readonly template = /^((?<hostname>[^:]+)(:(?<port>\d+))?)$/;
    private static defaultPorts = {
        'ftp:': '21',
        'gopher:': '70',
        'http:': '80',
        'https:': '443',
        'ws:': '80',
        'wss:': '443',
    };

    static create(patternConfig: string) {
        const { hostname, port } = this.template.exec(patternConfig)?.groups || {};

        return new BypassHostnamePattern(hostname, port);
    }

    private constructor(private readonly hostname: string, private readonly port: string | undefined) {
        super();
    }

    matches(url: URL): boolean {
        const urlPort = url.port || BypassHostnamePattern.defaultPorts[url.protocol]

        return url.hostname.endsWith(this.hostname)
            && (this.port ? urlPort === this.port : true);
    }
}

class BypassMatching extends ProxyBypass {

    private readonly patterns: BypassHostnamePattern[];

    constructor(value: string) {
        super();

        this.patterns = value.split(',').map(patternConfig => BypassHostnamePattern.create(patternConfig.trim()));
    }

    matches(url: URL): boolean {
        const normalisedUrl = createUrl(url);

        for (const pattern of this.patterns) {
            if (pattern.matches(normalisedUrl)) {
                return true;
            }
        }
        return false;
    }
}

