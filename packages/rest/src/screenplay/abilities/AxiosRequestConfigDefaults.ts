import { type CreateAxiosDefaults } from 'axios';

export type AxiosRequestConfigDefaults<Data = any> = Omit<CreateAxiosDefaults<Data>, 'proxy'> & {
    proxy?: {
        host: string;
        port?: number;          // SOCKS proxy doesn't require port number
        auth?: {
            username: string;
            password: string;
        };
        protocol?: string;
    }
}
