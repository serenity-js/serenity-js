import 'mocha';

import { given } from 'mocha-testdata';
import { OperatingSystem } from '../../src/io';
import { expect } from '../expect';

/** @test {OperatingSystem} */
describe('OperatingSystem', () => {

    const
        windows = { os: { platform: () => 'win32' },    proc: { }                           },
        msys    = { os: { platform: () => 'linux' },    proc: { env: { OSTYPE: 'msys' } }   },
        cygwin  = { os: { platform: () => 'linux' },    proc: { env: { OSTYPE: 'cygwin' } } },
        linux   = { os: { platform: () => 'linux' },    proc: { env: { } }                  },
        macos   = { os: { platform: () => 'darwin' },   proc: { env: { } }                  };

    const
        nullDevice  = '\\\\.\\NUL',
        devNull     = '/dev/null';

    given([
        { isWindows: true,   ...windows  },
        { isWindows: true,   ...msys     },
        { isWindows: true,   ...cygwin   },
        { isWindows: false,  ...linux    },
        { isWindows: false,  ...macos    },
    ]).
    it('recognises the type of the operating system', ({ os, proc, isWindows }: { os: any, proc: any, isWindows: boolean }) => {
        const operatingSystem = new OperatingSystem(os, proc);

        expect(operatingSystem.isWindows()).to.equal(isWindows);
    });

    given([
        { expectedPath: nullDevice, ...windows  },
        { expectedPath: nullDevice, ...msys     },
        { expectedPath: nullDevice, ...cygwin   },
        { expectedPath: devNull,    ...linux    },
        { expectedPath: devNull,    ...macos    },
    ]).
    it('tells the null device path', ({ expectedPath, os, proc }: { expectedPath: string, os: any, proc: any }) => {
        const operatingSystem = new OperatingSystem(os, proc);

        expect(operatingSystem.nullDevicePath()).to.equal(expectedPath);
    })
});
