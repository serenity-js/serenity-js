const querystring = require('querystring');

module.exports = function escaped(value) {
    return querystring.escape(value);
};
