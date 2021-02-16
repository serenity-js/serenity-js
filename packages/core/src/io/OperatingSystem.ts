import * as os from 'os';

export class OperatingSystem {
    constructor(
        private readonly operatingSystem: typeof os,
        private readonly proc: typeof process,
    ) {
    }

    public nullDevicePath(): string {
        return this.isWindows()
            ? `\\\\.\\NUL`
            : `/dev/null`;
    }

    public isWindows(): boolean {
        return this.operatingSystem.platform() === 'win32'
            || /^(msys|cygwin)$/.test(this.proc.env.OSTYPE);
    }
}
