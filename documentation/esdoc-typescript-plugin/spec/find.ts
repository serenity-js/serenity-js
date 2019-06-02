import fs = require('fs');

const docs = JSON.parse(fs.readFileSync('./target/index.json').toString());

export function find(key, ...values) {
    if (values.length === 1) {
        return docs.find((doc: any) => {
            if (typeof values[0] === 'string') {
                return doc[key] === values[0];
            }
            if (values[0] instanceof RegExp) {
                return doc[key].match(values[0]);
            }
        });
    }

    const results = [];
    for (const value of values) {
        const result = docs.find(doc => {
            if (typeof value === 'string') {
                return doc[key] === value;
            }
            if (value instanceof RegExp) {
                return doc[key].match(value);
            }
        });

        results.push(result);
    }

    return results;
}
