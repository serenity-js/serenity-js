export interface JSONObject {
    [x: string]: string | number | boolean | Date | JSONObject | JSONArray;
}

// tslint:disable-next-line:no-empty-interface - needed to define the JSONObject above
export interface JSONArray extends Array<string | number | boolean | Date | JSONObject | JSONArray> { }
