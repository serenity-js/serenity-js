import fs from 'node:fs';
import path from 'node:path';

export const certificates = {
    key:    fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
    cert:   fs.readFileSync(path.resolve(__dirname, '../certs/certificate.pem')),
};
