export class EnvironmentVariables {
    constructor(private readonly env: NodeJS.ProcessEnv = process.env) {
    }

    isSet(name: string): boolean {
        return this.env[name] !== undefined;
    }

    get(name: string): string | undefined {
        return this.env[name];
    }

    find(name: string): string | undefined {
        const candidateNames = [
            name,
            name.toLocaleUpperCase(),
            name.toLocaleLowerCase(),
        ];

        for (const variableName of candidateNames) {
            if (this.isSet(variableName)) {
                return this.get(variableName);
            }
        }

        return undefined;
    }

    findFirst(...names: string[]): string | undefined {
        for (const name of names) {
            const found = this.find(name);
            if (found) {
                return found;
            }
        }

        return undefined;
    }
}
