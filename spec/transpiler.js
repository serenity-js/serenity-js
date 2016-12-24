var path = require('path');

require('ts-node').register({
    lazy:    true,
    fast:    false,
    project: path.resolve(__dirname, '../')
});
