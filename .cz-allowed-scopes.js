const { sync: glob } = require('fast-glob');
const path = require('path');

const input = [ path.join(path.resolve(__dirname, `packages`),  `*/package.json`) ];
const paths = glob(input, { onlyFiles: false, globstar: true, absolute: true });

const serenityPackages = paths.map(pathToPackageJson => path.basename(path.dirname(pathToPackageJson)));

module.exports.scopes = {
    serenityPackages() {
        return serenityPackages;
    },
    documentation() {
        return [
            'examples',
        ];
    },
    dependencies() {
        return [
            // Changes to runtime dependencies
            'deps',
            // Changes to development-time dependencies
            'deps-dev',
        ];
    },
    ci() {
        return [
            // Configuration changes to "big" CI/CD tools that affect the whole project
            'github',
            'gitpod',
            'lerna',
            'renovate',
            'codeclimate',
            'codefactor',
            'eslint',
        ];
    },
    reservedForAutomatedCommits() {
        return [
            // Reserved for semantic release
            'release',
        ]
    },
    all() {
        return [
            ...this.serenityPackages(),
            ...this.documentation(),
            ...this.dependencies(),
            ...this.ci(),
            ...this.reservedForAutomatedCommits()
        ]
    }
}
