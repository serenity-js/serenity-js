const path = require('path');
const ESDocCLI = require('esdoc/out/src/ESDocCLI.js').default;

function cli() {
    const cliPath = path.resolve('./node_modules/esdoc/out/ESDocCLI.js');
    const argv = ['node', cliPath, '-c', './spec/esdoc.json'];
    const cli = new ESDocCLI(argv);
    cli.exec();
}

cli();
