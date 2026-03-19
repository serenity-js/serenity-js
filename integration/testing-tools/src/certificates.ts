import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

// Cross-platform way to find the package root
// Works in both ESM and CJS contexts
function getPackageRoot(): string {
    // createRequire works in both ESM and CJS
    // In ESM, we need to pass a URL; in CJS, we can use __filename
    // But since we're in a dual-build package, we use a workaround
    
    // Try to resolve our own package.json to find the package root
    try {
        // This works because package.json is exported in our package exports
        const require = createRequire(
            // Use a file URL that points to the current working directory
            // This is a workaround since we can't use import.meta.url in CJS
            `file://${process.cwd()}/`
        );
        const packageJsonPath = require.resolve('@integration/testing-tools/package.json');
        return path.dirname(packageJsonPath);
    } catch {
        // Fallback: search up from cwd for the testing-tools package
        return findPackageRoot(process.cwd());
    }
}

function findPackageRoot(startDirectory: string): string {
    // Also check node_modules for the package
    const nodeModulesPath = path.join(startDirectory, 'node_modules', '@integration', 'testing-tools');
    if (fs.existsSync(path.join(nodeModulesPath, 'package.json'))) {
        return nodeModulesPath;
    }
    
    // Check integration/testing-tools directly (for monorepo development)
    const integrationPath = path.join(startDirectory, 'integration', 'testing-tools');
    if (fs.existsSync(path.join(integrationPath, 'package.json'))) {
        return integrationPath;
    }
    
    // Search up the directory tree
    let directory = startDirectory;
    while (directory !== path.dirname(directory)) {
        const packageJsonPath = path.join(directory, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (pkg.name === '@integration/testing-tools') {
                    return directory;
                }
            } catch {
                // Continue searching
            }
        }
        directory = path.dirname(directory);
    }
    
    throw new Error('Could not find @integration/testing-tools package root');
}

const packageRoot = getPackageRoot();
const certsDirectory = path.join(packageRoot, 'certs');

export const certificates = {
    key:    fs.readFileSync(path.join(certsDirectory, 'key.pem')),
    cert:   fs.readFileSync(path.join(certsDirectory, 'certificate.pem')),
};
