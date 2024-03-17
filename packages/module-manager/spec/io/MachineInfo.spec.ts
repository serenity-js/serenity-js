import 'mocha';

import type * as nodeFs from 'node:fs';

import { expect } from '@integration/testing-tools';
import { createFsFromVolume, Volume } from 'memfs';

import { MachineInfo } from '../../src/io/MachineInfo.js';
import { Stubs } from '../Stubs.js';

describe('MachineInfo', () => {

    const stubs = Stubs.from('io/stubs');
    const emptyFs = createFsFromVolume(Volume.fromJSON({ })) as unknown as typeof nodeFs;
    const dockerFsWithCGroup = createFsFromVolume(Volume.fromJSON({
        '/proc/1/cgroup': '12:memory:/docker/1234567890abcdef'
    })) as unknown as typeof nodeFs;
    const dockerFsWithSocket = createFsFromVolume(Volume.fromJSON({
        '/var/run/docker.sock': ''
    })) as unknown as typeof nodeFs;

    it('recognises operating system environment', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );

        expect(info.os()).to.equal('Linux x64 5.4.0-1103-aws');
        expect(info.runsInDocker()).to.equal(false);
    });

    describe('Docker', () => {
        it(`doesn't check for Docker-specific files when running on Windows`, () => {
            const info = new MachineInfo(
                stubs.get('os'),
                stubs.get('process', { platform: 'win32' }),
                emptyFs,
            );

            expect(info.runsInDocker()).to.equal(false);
        });

        it('recognises Docker containers based on /proc/self/cgroup', () => {
            const info = new MachineInfo(
                stubs.get('os'),
                stubs.get('process'),
                dockerFsWithCGroup,
            );

            expect(info.os()).to.equal('Linux x64 5.4.0-1103-aws (Docker)');
            expect(info.runsInDocker()).to.equal(true);
        });

        it('recognises Docker containers based on the presence of /var/run/docker.sock', () => {
            const info = new MachineInfo(
                stubs.get('os'),
                stubs.get('process'),
                dockerFsWithSocket,
            );

            expect(info.os()).to.equal('Linux x64 5.4.0-1103-aws (Docker)');
            expect(info.runsInDocker()).to.equal(true);
        });

    });

    it('recognises the runtime environment', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );

        expect(info.runtime()).to.equal('Node.js 16.18.0')
    });

    it('recognises the chip', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );

        expect(info.chip()).to.equal('Intel(R) Xeon(R) Platinum 8259CL CPU @ 2.50GHz');
    });

    it('recognises the amount of memory', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );

        expect(info.memory()).to.equal('8.00 GB');
    });

    it('recognises the hostname', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );

        expect(info.hostname()).to.deep.equal('c35ec3ac6014');
    });

    it('recognises non-internal MAC addresses', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );

        expect(info.macAddresses()).to.deep.equal([
            '00:1a:2b:3c:4d:5e'
        ]);
    });
});
