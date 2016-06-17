import {Actor} from "../actor";
import {Performable} from "../performable";

export class Open implements Performable {

    static browserOn(website: string) : Open {
        return new Open(website);
    }

    performAs(actor: Actor):Promise<void> {
        return new Promise<void>((resolve, reject) => {
            browser.get(this.website).then(resolve, reject)
        })
    }

    constructor(website: string) {
        this.website = website;
    }

    private website : string;
}