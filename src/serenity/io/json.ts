export interface JSONObject {
    [x: string]: string | number | boolean | Date | JSON | JSONArray;
}

export interface JSONArray extends Array<string | number | boolean | Date | JSONObject | JSONArray> { }
