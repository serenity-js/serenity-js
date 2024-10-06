import { type JSONValue } from 'tiny-types';

export interface Deserialiser<Return_Type> {
    fromJSON(o: JSONValue): Return_Type;
}
