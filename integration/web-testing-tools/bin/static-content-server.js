#!/usr/bin/env node

const port = process.env.PORT || 8080;

require('../lib/index').app
    .listen(port, () => process.stdout.write(`Static content server started on ${ port }\n`));
