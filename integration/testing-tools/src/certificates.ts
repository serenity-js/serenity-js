import * as fs from 'fs';
import * as path from 'path';

export const certificates = {
    key:    fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
    cert:   fs.readFileSync(path.resolve(__dirname, '../certs/certificate.pem')),
};
