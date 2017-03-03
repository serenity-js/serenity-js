export function attemptToRequire(module: string) {
    try {
        return require(module);
    } catch (e) {
        throw new Error(
            `This feature requires the '${ module }' module, which seems to be missing. To install it, run: ` +
            `\`npm install ${ module } --save[-dev]\``);
    }
}
