module.exports = function isCI() {
    return process.env.CI && process.env.CI === 'true';
};

