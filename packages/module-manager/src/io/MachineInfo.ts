import type * as fs from 'node:fs';
import * as os from 'node:os';

import * as gracefulFs from 'graceful-fs';

import { MacAddress } from './MacAddress.js';

export class MachineInfo {
    constructor(
        private readonly nodeOs: typeof os = os,
        private readonly nodeProcess: NodeJS.Process = process,
        private readonly nodeFs: typeof fs = gracefulFs,
    ) {
    }

    os(): string {
        const suffix = this.runsInDocker() ? ' (Docker)' : '';

        return `${ this.nodeOs.type() } ${ this.nodeOs.arch() } ${ this.nodeOs.release() }${ suffix }`;
    }

    runtime(): string {
        return `Node.js ${ this.nodeProcess.versions.node }`;
    }

    hostname(): string {
        return this.nodeOs.hostname();
    }

    runsInDocker(): boolean {
        if (this.nodeProcess.platform === 'win32') {
            return false;
        }

        try {
            if (this.nodeFs.existsSync('/proc/1/cgroup')) {
                const content = this.nodeFs.readFileSync('/proc/1/cgroup', 'utf8');
                if (content.includes('/docker/')) {
                    return true;
                }
            }

            return Boolean(this.nodeFs.existsSync('/var/run/docker.sock'));
        }
        catch {
            return false;
        }
    }

    chip(): string {
        return this.nodeOs.cpus()[0].model;
    }

    memory(): string {
        const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

        let size = this.nodeOs.totalmem();
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${ size.toFixed(2) } ${ units[unitIndex] }`;
    }

    macAddresses(): string[] {

        const externalMacAddresses = new Set<string>();

        for (const [ interfaceName_, networkInterfaces ] of Object.entries(this.nodeOs.networkInterfaces())) {
            for (const networkInterface of networkInterfaces) {
                if (! networkInterface.internal && new MacAddress(networkInterface.mac).isUnique()) {
                    externalMacAddresses.add(networkInterface.mac);
                }
            }
        }

        return Array.from(new Set(externalMacAddresses));
    }
}
