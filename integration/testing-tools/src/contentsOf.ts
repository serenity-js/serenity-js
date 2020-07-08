import fs = require('fs');
import path = require('path');

export function contentsOf(...pathSegments: string[]) {
    return fs.readFileSync(path.join(...pathSegments), 'utf8');
}
