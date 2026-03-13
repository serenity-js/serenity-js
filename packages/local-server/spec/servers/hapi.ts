/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// https://github.com/hapijs/hapi

import hapi from '@hapi/hapi';

export default {
    node: '>= 8.12',
    description: 'Hapi app',
    handler: (options?: any) => {
        const server = new hapi.Server(options);

        server.route({ method: 'GET', path: '/', handler: (request, h) => 'Hello World!' });

        return server.listener;
    },
};
